import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Divider
} from '@mui/material';
import { Bill, BillStatus, billingService } from '../../services/billingService';

interface BillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  onStatusChange: () => void;
  bill: Bill | null;
}

const BillDetailsDialog: React.FC<BillDetailsDialogProps> = ({
  open,
  onClose,
  onStatusChange,
  bill
}) => {
  const [status, setStatus] = useState<BillStatus>(BillStatus.PENDING);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  React.useEffect(() => {
    if (bill) {
      setStatus(bill.status);
    }
  }, [bill]);

  const handleStatusChange = async () => {
    if (!bill?.id) return;

    setIsUpdating(true);
    try {
      await billingService.updateBillStatus(bill.id, status);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error updating bill status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return 'success';
      case BillStatus.PENDING:
        return 'warning';
      case BillStatus.PARTIALLY_PAID:
        return 'info';
      case BillStatus.OVERDUE:
        return 'error';
      case BillStatus.CANCELLED:
        return 'default';
      default:
        return 'default';
    }
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Bill Details - {bill.billNumber}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Patient Information
          </Typography>
          <Typography><strong>Name:</strong> {bill.patient?.firstName} {bill.patient?.lastName}</Typography>
          <Typography><strong>Email:</strong> {bill.patient?.email}</Typography>
          <Typography><strong>Phone:</strong> {bill.patient?.phone}</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bill Information
          </Typography>
          <Typography><strong>Bill Number:</strong> {bill.billNumber}</Typography>
          <Typography><strong>Bill Date:</strong> {new Date(bill.billDate).toLocaleDateString()}</Typography>
          <Typography><strong>Due Date:</strong> {new Date(bill.dueDate).toLocaleDateString()}</Typography>
          <Typography><strong>Hospital:</strong> {bill.hospital?.name}</Typography>
          <Box sx={{ mt: 1 }}>
            <Chip
              label={bill.status}
              color={getStatusColor(bill.status) as any}
              size="small"
            />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bill Items
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Tax</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bill.billItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">₹{item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{item.taxAmount.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{item.totalAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Subtotal:</Typography>
            <Typography>₹{bill.subTotal.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Tax:</Typography>
            <Typography>₹{bill.taxAmount.toFixed(2)}</Typography>
          </Box>
          {bill.discountAmount && bill.discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Discount:</Typography>
              <Typography>-₹{bill.discountAmount.toFixed(2)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Total Amount:</Typography>
            <Typography variant="h6">₹{bill.totalAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Paid Amount:</Typography>
            <Typography>₹{bill.paidAmount.toFixed(2)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6" color={bill.balanceAmount > 0 ? 'error' : 'success'}>
              Balance Due:
            </Typography>
            <Typography variant="h6" color={bill.balanceAmount > 0 ? 'error' : 'success'}>
              ₹{bill.balanceAmount.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as BillStatus)}
              label="Update Status"
            >
              {Object.values(BillStatus).map((statusOption) => (
                <MenuItem key={statusOption} value={statusOption}>
                  {statusOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            color="primary"
            onClick={handleStatusChange}
            disabled={isUpdating || status === bill.status}
          >
            {isUpdating ? <CircularProgress size={24} /> : 'Update Status'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillDetailsDialog;
