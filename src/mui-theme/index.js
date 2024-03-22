import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const theme = (props) => {

  return extendTheme({
    typography: {
      fontFamily: 'Inter, sans-serif',
    },
    components: {
      MuiLoadingButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            paddingTop: 14,
            paddingBottom: 14,
            boxShadow: 'unset !important'
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: 12,
            paddingRight: 12,
          },
        },
      },
    },
    palette: {
      primary: {
        // light: will be calculated from palette.primary.main,
        main: props?.primary ? props?.primary : '#f00',
        // dark: will be calculated from palette.primary.main,
        // contrastText: will be calculated to contrast with palette.primary.main
      },
      secondary: {
        main: props?.secondary ? props?.secondary : '#f1eff4',
        // dark: will be calculated from palette.secondary.main,
      },
      info: {
        main: props?.brand ? props?.brand : '#000',
        // contrastText: will be calculated to contrast with palette.primary.main
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 992,
        lg: 1248,
        xl: 1440,
      },
    },
  })
}

export default theme
