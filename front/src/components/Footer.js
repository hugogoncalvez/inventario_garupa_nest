import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Copyright from './CopyRight';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'var(--mui-palette-background-paper)',
        borderTop: '1px solid var(--mui-palette-divider)',
      }}
    >
      <Container maxWidth="sm">
        <Copyright nombre='Hugo Goncalvez' />
      </Container>
    </Box>
  );
}
