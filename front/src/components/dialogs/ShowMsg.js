import * as React from 'react';
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { Stack } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function DialogSlide({ confirmacion, handleConfirmacion, msg, ruta, error, titulo, color, msgErr }) {
  const [open, setOpen] = React.useState(true);

  const navigate = useNavigate();

  // console.log(confirmacion)
  // console.log(handleConfirmacion)




  const handleClose = () => {
    setOpen(false);
    navigate(ruta);
  };


  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >

        <DialogTitle sx={{ color: { color } }}><Stack direction="row" alignItems="center" gap={2}>
          {error ? < WarningAmberIcon color='error' fontSize='large' /> : <DoneOutlineIcon color="success" fontSize='large' />} {titulo}
        </Stack></DialogTitle>
        <DialogContent sx={{ alignItems: 'center' }}>
          <DialogContentText sx={{ color: 'black' }} id="alert-dialog-slide-description">
            {msg}
            <br />
            {msgErr}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={!confirmacion ? handleClose : handleConfirmacion}>Aceptar</Button>
        </DialogActions>

      </Dialog>

    </>
  );
}


