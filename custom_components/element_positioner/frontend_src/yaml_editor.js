import { basicSetup } from "codemirror";
import { autocompletion } from "@codemirror/autocomplete";
import { indentLess, indentMore } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { HighlightStyle, syntaxHighlighting, syntaxTree, indentUnit } from "@codemirror/language";
import { linter } from "@codemirror/lint";
import { searchKeymap, openSearchPanel } from "@codemirror/search";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";

function buildEntityOptions(entities) {
  return (entities || []).map((entity) => ({
    label: entity.entity_id,
    type: "variable",
    detail: entity.name || "",
    apply: entity.entity_id,
  }));
}

function shouldOfferEntityCompletion(line, token, explicit) {
  if (explicit) return true;
  if (/entity\s*:\s*[\w.-]*$/i.test(line)) return true;
  if (/entities\s*:\s*.*[\w.-]*$/i.test(line)) return true;
  return /^[a-z_]+\.[\w.-]*$/i.test(token || "");
}

function entityCompletion(entities) {
  const options = buildEntityOptions(entities);
  return (context) => {
    const before = context.matchBefore(/[\w.-]*/);
    const token = before ? before.text : "";
    const line = context.state.doc.lineAt(context.pos).text.slice(0, context.pos - context.state.doc.lineAt(context.pos).from);
    if (!before || !shouldOfferEntityCompletion(line, token, context.explicit)) return null;
    return {
      from: before.from,
      options,
      validFor: /^[\w.-]*$/,
    };
  };
}

function createTheme() {
  return EditorView.theme({
    "&": {
      height: "100%",
      color: "#e0e0e0",
      backgroundColor: "#111",
      border: "1px solid #FF5733",
      borderRadius: "8px",
      fontSize: "15px",
    },
    ".cm-scroller": {
      fontFamily: "Menlo, Consolas, Monaco, monospace",
      lineHeight: "1.5",
      overflow: "auto",
    },
    ".cm-content": {
      caretColor: "#FF5733",
      padding: "12px 0",
    },
    ".cm-gutters": {
      backgroundColor: "#151515",
      color: "#777",
      borderRight: "1px solid #333",
    },
    ".cm-activeLine": {
      backgroundColor: "rgba(255,87,51,0.10)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(255,87,51,0.14)",
      color: "#ddd",
    },
    ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
      backgroundColor: "rgba(255,87,51,0.35)",
    },
    "&.cm-focused": {
      outline: "none",
      boxShadow: "0 0 0 1px rgba(255,87,51,0.45)",
    },
    ".cm-tooltip": {
      backgroundColor: "#202020",
      border: "1px solid #444",
      color: "#e0e0e0",
    },
    ".cm-tooltip-autocomplete ul li[aria-selected]": {
      backgroundColor: "#FF5733",
      color: "#fff",
    },
    ".tok-keyword, .tok-atom, .tok-bool, .tok-labelName": {
      color: "#ffb86c !important",
    },
    ".tok-literal, .tok-number": {
      color: "#f1fa8c !important",
    },
    ".tok-string, .tok-string2, .tok-url": {
      color: "#8be9a8 !important",
    },
    ".tok-variableName, .tok-variableName2, .tok-propertyName, .tok-definition, .tok-typeName, .tok-namespace": {
      color: "#f8f8f2 !important",
    },
    ".tok-punctuation, .tok-operator": {
      color: "#b9bec8 !important",
    },
    ".tok-comment": {
      color: "#8b949e !important",
      fontStyle: "italic",
    },
    ".tok-invalid": {
      color: "#ff5555 !important",
      textDecoration: "underline",
    },
  }, { dark: true });
}

function createHighlightStyle() {
  return HighlightStyle.define([
    { tag: tags.keyword, color: "#ffb86c" },
    { tag: [tags.atom, tags.bool], color: "#ffb86c" },
    { tag: [tags.number, tags.integer, tags.float], color: "#f1fa8c" },
    { tag: tags.string, color: "#8be9a8" },
    { tag: tags.escape, color: "#ff79c6" },
    { tag: [tags.variableName, tags.propertyName, tags.attributeName], color: "#f8f8f2" },
    { tag: tags.definitionKeyword, color: "#bd93f9" },
    { tag: [tags.separator, tags.punctuation], color: "#b9bec8" },
    { tag: tags.comment, color: "#8b949e", fontStyle: "italic" },
    { tag: tags.invalid, color: "#ff5555", textDecoration: "underline" },
  ]);
}

function createYamlEditor(options) {
  const parent = options.parent;
  const doc = options.doc || "";
  const entities = options.entities || [];
  const onSave = options.onSave;
  function diagnostics(state) {
    const errors = [];
    syntaxTree(state).iterate({ enter(node) {
      if (!node.type.isError) return;
      const line = state.doc.lineAt(node.from);
      errors.push({from:node.from, to:node.to, severity:"error", message:`YAML-Fehler in Zeile ${line.number}, Spalte ${node.from - line.from + 1}`});
    }});
    return errors;
  }
  function reportPosition(state) {
    const pos = state.selection.main.head;
    const line = state.doc.lineAt(pos);
    options.onPosition?.(line.number, pos - line.from + 1);
  }

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        yaml(),
        indentUnit.of("  "),
        linter(v => diagnostics(v.state)),
        EditorView.updateListener.of(update => {
          if (update.selectionSet || update.docChanged) reportPosition(update.state);
        }),
        createTheme(),
        syntaxHighlighting(createHighlightStyle(), { fallback: true }),
        EditorView.lineWrapping,
        autocompletion({ override: [entityCompletion(entities)] }),
        Prec.high(keymap.of([
          { key: "Tab", run: indentMore },
          { key: "Shift-Tab", run: indentLess },
          {
            key: "Mod-s",
            run() {
              if (onSave) onSave();
              return true;
            },
          },
          ...searchKeymap,
        ])),
      ],
    }),
  });
  reportPosition(view.state);

  return {
    search() { openSearchPanel(view); },
    validate() { return diagnostics(view.state); },
    focus() {
      view.focus();
    },
    getValue() {
      return view.state.doc.toString();
    },
    setValue(value) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value || "" },
      });
    },
    destroy() {
      view.destroy();
    },
  };
}

window.ElementPositionerYamlEditor = {
  create: createYamlEditor,
  version: "0.29.8",
};
