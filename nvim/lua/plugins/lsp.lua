-- LSP: mason (installer) + mason-lspconfig v2 + nvim-lspconfig, wired for the
-- native Neovim 0.11+/0.12 API (vim.lsp.config / vim.lsp.enable).
--
-- How it fits together:
--   * blink.cmp provides completion capabilities -> advertised to every server.
--   * vim.lsp.config("name", {...}) supplies per-server overrides (deep-merged
--     on top of the config nvim-lspconfig ships).
--   * mason-lspconfig.setup({ ensure_installed = {...} }) installs the servers
--     and (automatic_enable defaults to true) calls vim.lsp.enable() for each.
--
-- Add a server later: append its nvim-lspconfig name to `ensure_installed`
-- below (e.g. "lua_ls", "basedpyright", "ruff"). Add a vim.lsp.config(...) block
-- only if you need non-default settings.
return {
  "neovim/nvim-lspconfig",
  dependencies = {
    { "mason-org/mason.nvim", opts = {} },
    "mason-org/mason-lspconfig.nvim",
    "saghen/blink.cmp",
  },
  config = function()
    -- 1. Completion capabilities for all servers (from blink.cmp).
    vim.lsp.config("*", {
      capabilities = require("blink.cmp").get_lsp_capabilities(),
    })

    -- 2. Per-server overrides (deltas only; defaults come from nvim-lspconfig).
    vim.lsp.config("clangd", {
      -- cmd = { "clangd", "--background-index", "--clang-tidy" },
    })

    vim.lsp.config("ts_ls", {
      -- settings = { typescript = { ... } },
    })

    -- 3. Install + auto-enable. Names are nvim-lspconfig SERVER names
    --    (ts_ls -> typescript-language-server package), not mason package names.
    require("mason-lspconfig").setup({
      ensure_installed = { "clangd", "ts_ls" },
    })

    -- 4. Buffer-local keymaps once a server attaches.
    vim.api.nvim_create_autocmd("LspAttach", {
      callback = function(ev)
        local map = function(keys, fn, desc)
          vim.keymap.set("n", keys, fn, { buffer = ev.buf, desc = "LSP: " .. desc })
        end
        map("gd", vim.lsp.buf.definition, "Goto definition")
        map("gr", vim.lsp.buf.references, "References")
        map("gI", vim.lsp.buf.implementation, "Goto implementation")
        map("K", vim.lsp.buf.hover, "Hover")
        map("<leader>rn", vim.lsp.buf.rename, "Rename symbol")
        map("<leader>ca", vim.lsp.buf.code_action, "Code action")
        map("gl", vim.diagnostic.open_float, "Line diagnostics")
        map("[d", function() vim.diagnostic.jump({ count = -1 }) end, "Prev diagnostic")
        map("]d", function() vim.diagnostic.jump({ count = 1 }) end, "Next diagnostic")
      end,
    })
  end,
}
