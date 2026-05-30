-- vim-surround: add/change/delete surrounding pairs (quotes, brackets, tags).
-- Operates via the cs/ds/ys mappings in normal mode and S in visual mode.
-- (vim-repeat, added as a companion, lets `.` repeat surround edits.)
return {
  "tpope/vim-surround",
  dependencies = { "tpope/vim-repeat" },
  event = "VeryLazy", -- not needed at startup; load lazily
}
