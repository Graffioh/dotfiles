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
        -- Floating, previewable list of every usage site (Telescope picker)
        -- instead of the default quickfix dump from vim.lsp.buf.references.
        map("gr", "<cmd>Telescope lsp_references<cr>", "References (Telescope)")
        map("gI", vim.lsp.buf.implementation, "Goto implementation")
        map("K", vim.lsp.buf.hover, "Hover")
        map("<leader>rn", vim.lsp.buf.rename, "Rename symbol")
        map("<leader>ca", vim.lsp.buf.code_action, "Code action")
        map("gl", vim.diagnostic.open_float, "Line diagnostics")
        map("<leader>glc", function()
          -- Copy this line's diagnostic message(s) to the system clipboard.
          -- Matches gl's scope (whole line); joins multiple with newlines.
          local lnum = vim.api.nvim_win_get_cursor(0)[1] - 1 -- 0-indexed
          local diags = vim.diagnostic.get(ev.buf, { lnum = lnum })
          if vim.tbl_isempty(diags) then
            vim.notify("No diagnostics on this line", vim.log.levels.INFO)
            return
          end
          local msgs = vim.tbl_map(function(d)
            return d.message
          end, diags)
          vim.fn.setreg("+", table.concat(msgs, "\n"))
          vim.notify("Copied diagnostic to clipboard")
        end, "Copy line diagnostic(s) to clipboard")
        map("[d", function() vim.diagnostic.jump({ count = -1 }) end, "Prev diagnostic")
        map("]d", function() vim.diagnostic.jump({ count = 1 }) end, "Next diagnostic")
      end,
    })
  end,
}
