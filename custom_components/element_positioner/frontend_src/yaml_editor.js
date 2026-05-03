import { basicSetup } from "codemirror";
import { autocompletion } from "@codemirror/autocomplete";
import { indentLess, indentMore } from "@codemirror/commands";
import { yaml } from "@codemirror/lang-yaml";
import { searchKeymap } from "@codemirror/search";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";

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
      fontSize: "12px",
    },
    ".cm-scroller": {
      fontFamily: "Menlo, Consolas, Monaco, monospace",
      lineHeight: "1.5",
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
  }, { dark: true });
}

function createYamlEditor(options) {
  const parent = options.parent;
  const doc = options.doc || "";
  const entities = options.entities || [];
  const onSave = options.onSave;

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        yaml(),
        createTheme(),
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

  return {
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
  version: "0.29.7",
};
