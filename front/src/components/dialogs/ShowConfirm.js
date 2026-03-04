import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';




export default function SimpleDialog(props) {
  const { onClose, open } = props;

  const handleClose = () => {
    onClose(false);
  };

  const handleClick = (value) => {
    onClose(value)
  }


  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Eliminar Item Inventario</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Esta seguro de eliminar el elemento del inventario?.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClick(false)}>Cancelar</Button>
        <Button onClick={() => handleClick(true)}>Aceptar</Button>
      </DialogActions>
    </Dialog>
  );
}