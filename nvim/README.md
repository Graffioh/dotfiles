# nvim

A small, hand-rolled Neovim config (kickstart-style, not a distro). Targets
**Neovim 0.12+**. Plugins managed by [lazy.nvim](https://github.com/folke/lazy.nvim).

## Layout

```
init.lua                 leader + load order
lua/config/
  options.lua            editor options (vim.opt)
  keymaps.lua            general keymaps
  lazy.lua               bootstrap lazy.nvim, import lua/plugins/*
lua/plugins/
  colorscheme.lua        eldritch theme
  oil.lua                file explorer (edit fs as a buffer)
  treesitter.lua         syntax (nvim-treesitter, main branch)
  lsp.lua                mason + mason-lspconfig + nvim-lspconfig
  completion.lua         blink.cmp
  telescope.lua          fuzzy finder
  lualine.lua            statusline
  gitsigns.lua           git gutter signs
  lazygit.lua            lazygit integration
  mini.lua               mini.pairs (autopairs)
```

## Keymaps (leader = `<Space>`)

| Key          | Action                         |
| ------------ | ------------------------------ |
| `-`          | Open parent dir (oil)          |
| `<leader>ff` | Find files (Telescope)         |
| `<leader>fg` | Live grep                      |
| `<leader>fb` | Buffers                        |
| `<leader>fh` | Help tags                      |
| `<leader>fd` | Diagnostics                    |
| `<leader>gg` | LazyGit                        |
| `<leader>cp` | Copy relative file path        |
| `<leader>rn` | LSP rename                     |
| `<leader>ca` | LSP code action                |
| `gd` `gr` `gI` `K` | LSP definition/refs/impl/hover |
| `[d` `]d`    | Prev/next diagnostic           |
| `<C-h/j/k/l>`| Move between windows           |

## External tools

- `clangd` (C/C++), `node`/`npm` (TS) — installed via `:Mason` automatically
- `ripgrep` — Telescope live grep
- `lazygit` — lazygit.nvim
- `make` + C compiler — optional telescope-fzf-native sorter
- A Nerd Font — icons

## Adding an LSP server

Append its nvim-lspconfig name to `ensure_installed` in `lua/plugins/lsp.lua`
(e.g. `"lua_ls"`, `"basedpyright"`, `"ruff"`). Add a `vim.lsp.config("name", {...})`
block only if you need non-default settings.

## Adding a treesitter parser

Add the language to the `langs` list in `lua/plugins/treesitter.lua`, or run
`:TSInstall <lang>` once.

## Maintenance

- `:Lazy` — manage plugins, `:Lazy sync` to install/update, `:Lazy clean` to
  remove unused (run once after switching from the old config)
- `:Mason` — manage LSP servers / tools
- `:checkhealth` — diagnose issues
