-- Completion: blink.cmp. Pinned to the 1.x stable line, which ships a prebuilt
-- fuzzy-matcher binary per release tag -> no Rust toolchain required.
-- Its capabilities are exposed to LSP in lua/plugins/lsp.lua.
return {
  "saghen/blink.cmp",
  dependencies = { "rafamadriz/friendly-snippets" },
  version = "1.*",
  ---@module 'blink.cmp'
  ---@type blink.cmp.Config
  opts = {
    -- 'default'  : <C-y> accept, <C-n>/<C-p> navigate
    -- 'super-tab': <Tab> accept/expand   'enter': <CR> accept
    keymap = { preset = "default" },
    appearance = {
      nerd_font_variant = "mono", -- use "normal" for a non-mono Nerd Font
    },
    completion = {
      documentation = { auto_show = true, auto_show_delay_ms = 200 },
    },
    sources = {
      default = { "lsp", "path", "snippets", "buffer" },
    },
    fuzzy = { implementation = "prefer_rust_with_warning" },
    signature = { enabled = true },
  },
  opts_extend = { "sources.default" },
}
