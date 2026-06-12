-- Formatting: conform.nvim runs real, per-filetype formatters and handles
-- format-on-save. We prefer dedicated tools over LSP formatting (clangd/ts_ls)
-- because stylua/clang-format/prettier are the canonical formatters and honor
-- project config (stylua.toml, .clang-format, .prettierrc).
--
-- The formatter binaries are installed through mason (see the second spec
-- below), keeping this reproducible alongside the LSP servers in lsp.lua.
return {
  {
    "stevearc/conform.nvim",
    event = { "BufWritePre" }, -- load just before the first save
    cmd = { "ConformInfo" }, -- :ConformInfo shows what would run on this buffer
    keys = {
      {
        "<leader>cf",
        function()
          require("conform").format({ async = true, lsp_format = "fallback" })
        end,
        mode = { "n", "v" },
        desc = "Format buffer / selection",
      },
    },
    opts = {
      formatters_by_ft = {
        lua = { "stylua" },
        c = { "clang_format" },
        cpp = { "clang_format" },
        javascript = { "prettier" },
        typescript = { "prettier" },
        javascriptreact = { "prettier" },
        typescriptreact = { "prettier" },
        json = { "prettier" },
        -- ruff is the canonical Python formatter; organize imports first, then
        -- format. Same `ruff` binary the LSP uses (installed via mason in lsp.lua).
        python = { "ruff_organize_imports", "ruff_format" },
        -- Any filetype not listed falls back to the LSP via lsp_format below.
      },
      -- Run on save. lsp_format = "fallback": use the configured formatter when
      -- present, otherwise let the attached LSP format. timeout_ms keeps a slow
      -- formatter from blocking the save indefinitely.
      format_on_save = {
        timeout_ms = 1000,
        lsp_format = "fallback",
      },
    },
  },

  -- Auto-install the formatter binaries through mason (same ensure_installed
  -- spirit as mason-lspconfig). stylua is usually already present; this adds
  -- clang-format and prettier. Depends on mason so it runs after mason loads.
  {
    "WhoIsSethDaniel/mason-tool-installer.nvim",
    dependencies = { "mason-org/mason.nvim" },
    opts = {
      ensure_installed = { "stylua", "clang-format", "prettier" },
    },
  },
}
