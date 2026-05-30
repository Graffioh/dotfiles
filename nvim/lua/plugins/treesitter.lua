-- nvim-treesitter on the MAIN (rewritten) branch — required for Neovim 0.12+.
-- The frozen `master` branch does NOT support 0.12. The `main` branch has no
-- setup()/ensure_installed; you install parsers explicitly and enable
-- highlight + indent yourself via a FileType autocmd.
return {
  "nvim-treesitter/nvim-treesitter",
  branch = "main",
  lazy = false, -- the plugin does not support lazy-loading
  build = ":TSUpdate",
  config = function()
    local langs = {
      "c", "cpp", "lua", "vim", "vimdoc", "query",
      "markdown", "markdown_inline", -- inline parser needed for code spans/links
      "bash", "javascript", "typescript", "tsx", "json", "python",
    }

    -- Install/update the listed parsers. Async + idempotent (no-op if present).
    -- On a brand-new machine the first file may open un-highlighted until the
    -- parser finishes compiling; reopen the buffer once it's done.
    require("nvim-treesitter").install(langs)

    -- Turn on tree-sitter highlighting + indentation per buffer on FileType.
    vim.api.nvim_create_autocmd("FileType", {
      pattern = {
        "c", "cpp", "lua", "vim", "help", "query",
        "markdown",
        "sh", "bash",
        "javascript", "javascriptreact",
        "typescript", "typescriptreact",
        "json", "jsonc",
        "python",
      },
      callback = function()
        -- pcall guards the case where the parser is still installing.
        pcall(vim.treesitter.start)
        -- tree-sitter based indentation (quoting below is exact — do not change)
        vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
      end,
    })
  end,
}
