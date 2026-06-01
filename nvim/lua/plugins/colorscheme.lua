-- Colorscheme: solarized (https://github.com/maxmx03/solarized.nvim)
-- priority = 1000 + lazy = false so it loads before other UI plugins and the
-- highlights are applied at startup.
return {
  "maxmx03/solarized.nvim",
  name = "solarized",
  lazy = false,
  priority = 1000,
  opts = {},
  config = function(_, opts)
    require("solarized").setup(opts)
    -- Pick the dark variant (solarized also ships a light one).
    vim.o.background = "dark"
    vim.cmd.colorscheme("solarized")
  end,
}
