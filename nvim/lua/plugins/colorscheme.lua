-- Colorscheme: eldritch (https://github.com/eldritch-theme/eldritch.nvim)
-- priority = 1000 + lazy = false so it loads before other UI plugins and the
-- highlights are applied at startup.
return {
  "eldritch-theme/eldritch.nvim",
  lazy = false,
  priority = 1000,
  opts = {
    -- transparent = true,
    -- terminal_colors = true,
  },
  config = function(_, opts)
    require("eldritch").setup(opts)
    vim.cmd.colorscheme("eldritch")
  end,
}
