-- indent-blankline.nvim (ibl): vertical "left bars" marking each indentation
-- level/block. `scope` highlights the bar of the block the cursor sits in and
-- underlines its first/last line, using tree-sitter (core vim.treesitter API,
-- so it's compatible with our `main`-branch nvim-treesitter setup).
return {
  "lukas-reineke/indent-blankline.nvim",
  main = "ibl",
  event = { "BufReadPost", "BufNewFile" },
  opts = {
    indent = { char = "│" }, -- the per-level guide bar
    scope = {
      enabled = true,
      show_start = true, -- underline the block's opening line
      show_end = false,
    },
  },
}
