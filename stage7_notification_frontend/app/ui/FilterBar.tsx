"use client";

import {
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Stack,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";

const types = ["All", "Placement", "Result", "Event"];

export function TypeFilter({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ToggleButtonGroup
      color="primary"
      exclusive
      value={value}
      onChange={(_, nextValue) => nextValue && onChange(nextValue)}
      size="small"
      sx={{ flexWrap: "wrap" }}
    >
      {types.map((type) => (
        <ToggleButton key={type} value={type}>
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function LimitSelect({
  value,
  options,
  onChange
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <FormControl size="small" sx={{ minWidth: 130 }}>
      <InputLabel id="limit-select-label">Show Top</InputLabel>
      <Select
        labelId="limit-select-label"
        label="Show Top"
        value={String(value)}
        onChange={(event: SelectChangeEvent) => onChange(Number(event.target.value))}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            Top {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function Pager({
  page,
  onChange
}: {
  page: number;
  onChange: (page: number) => void;
}) {
  return (
    <Stack alignItems="center" sx={{ mt: 3 }}>
      <Pagination page={page} count={8} color="primary" onChange={(_, value) => onChange(value)} />
    </Stack>
  );
}

