import { useEffect, useRef } from "react";
import { basicSetup, EditorView } from "codemirror";
import { Compartment, EditorState } from "@codemirror/state";
import { html } from "@codemirror/lang-html";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { useTheme } from "./theme";
function appearance(dark: boolean) {
  const colors = dark
    ? [
        "#ffd887",
        "#cae895",
        "#a6bdcc",
        "#ffa7a7",
        "#afddf5",
        "#e8b7ff",
        "#d4edf2",
        "#c5d2df",
      ]
    : [
        "#754200",
        "#285c16",
        "#4e6274",
        "#982b3b",
        "#125f82",
        "#734191",
        "#253b4b",
        "#405369",
      ];
  return [
    syntaxHighlighting(
      HighlightStyle.define(
        [
          tags.keyword,
          tags.string,
          tags.comment,
          tags.tagName,
          tags.attributeName,
          tags.number,
          tags.variableName,
          tags.punctuation,
        ].map((tag, i) => ({ tag, color: colors[i] })),
      ),
    ),
    EditorView.theme(
      {
        "&": {
          height: "400px",
          backgroundColor: "var(--editor-bg)",
          color: "var(--editor-ink)",
          fontSize: "14px",
        },
        ".cm-scroller": {
          fontFamily: "ui-monospace, Consolas, monospace",
          lineHeight: "1.8",
          overflow: "auto",
        },
        ".cm-content": { padding: "16px 0", caretColor: "var(--ink)" },
        ".cm-gutters": {
          backgroundColor: "var(--editor-bg)",
          color: "var(--muted)",
          border: "none",
          paddingRight: "8px",
        },
        ".cm-activeLine, .cm-activeLineGutter": {
          backgroundColor: "var(--hover)",
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
          {
            backgroundColor: dark ? "#375d72 !important" : "#c3deeb !important",
          },
        ".cm-cursor": { borderLeftColor: "var(--ink)" },
      },
      { dark },
    ),
  ];
}
export default function CodeEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    editor = useRef<EditorView | null>(null);
  const theme = useRef(new Compartment()),
    callback = useRef(onChange);
  const [, resolved] = useTheme();
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      doc: value,
      extensions: [
        basicSetup,
        html(),
        theme.current.of(appearance(resolved === "dark")),
        EditorState.changeFilter.of(
          (transaction) => transaction.newDoc.length <= 500000,
        ),
        EditorView.contentAttributes.of({
          "aria-label": "Project code",
          tabindex: "0",
          spellcheck: "false",
          autocapitalize: "off",
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) callback.current(update.state.doc.toString());
        }),
      ],
    });
    editor.current = view;
    return () => {
      view.destroy();
      editor.current = null;
    };
    // The editor owns its undo history. Later values and theme changes use the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    editor.current?.dispatch({
      effects: theme.current.reconfigure(appearance(resolved === "dark")),
    });
  }, [resolved]);
  useEffect(() => {
    const view = editor.current;
    if (view && view.state.doc.toString() !== value)
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
  }, [value]);
  return <div className="code-host" ref={host} />;
}
