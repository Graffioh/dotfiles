-- Entry point. Kept intentionally small: set leader, load core, load plugins.
-- Structure:
--   lua/config/options.lua   -> editor options (vim.opt)
--   lua/config/keymaps.lua   -> general keymaps
--   lua/config/lazy.lua      -> bootstrap lazy.nvim + import lua/plugins/*
--   lua/plugins/*.lua        -> one file per plugin

-- Leader must be set BEFORE lazy.nvim loads, since plugin `keys = {...}`
-- mappings are registered against it at startup.
vim.g.mapleader = " "
vim.g.maplocalleader = "\\"

require("config.options")
require("config.keymaps")
require("config.lazy")
