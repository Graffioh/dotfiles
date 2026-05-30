-- Statusline. theme = "auto" derives colors from the active colorscheme,
-- so it matches eldritch automatically.
return {
  "nvim-lualine/lualine.nvim",
  event = "VeryLazy",
  dependencies = { "nvim-tree/nvim-web-devicons" },
  opts = {
    options = {
      theme = "auto",
      globalstatus = true, -- single statusline across splits
    },
  },
}
