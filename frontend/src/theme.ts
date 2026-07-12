import { createTheme, MantineColorsTuple } from '@mantine/core';

const medicalColors: MantineColorsTuple = [
  '#e0f2fe', // 50
  '#bae6fd', // 100
  '#7dd3fc', // 200
  '#38bdf8', // 300
  '#0ea5e9', // 400
  '#0077ff', // 500 (our brand Medical Blue)
  '#0062E6', // 600
  '#005ecf', // 700
  '#0c4a6e', // 800
  '#082f49'  // 900
];

const navyColors: MantineColorsTuple = [
  '#eef2f6',
  '#dbe4ec',
  '#b7cbda',
  '#7ea2bf',
  '#43719c',
  '#2a5078',
  '#203d5d',
  '#1b324d',
  '#122033',
  '#0c1a30' // our brand Navy Blue
];

const emeraldColors: MantineColorsTuple = [
  '#ecfdf5', // 50
  '#d1fae5', // 100
  '#a7f3d0', // 200
  '#6ee7b7', // 300
  '#34d399', // 400
  '#10b981', // 500 (our brand Emerald Green)
  '#059669', // 600
  '#047857', // 700
  '#065f46', // 800
  '#064e3b'  // 900
];

export const theme = createTheme({
  primaryColor: 'medical',
  fontFamily: 'Inter, var(--font-sans), sans-serif',
  headings: {
    fontFamily: 'Poppins, var(--font-title), sans-serif',
  },
  colors: {
    medical: medicalColors,
    navy: navyColors,
    emerald: emeraldColors,
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
});
