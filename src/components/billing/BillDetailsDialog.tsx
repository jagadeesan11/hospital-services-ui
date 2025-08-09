import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  SelectChangeEvent
} from '@mui/material';
import { Bill, BillStatus, billingService } from '../../services/billingService';

interface BillDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
  onStatusChange: () => void;
}

const BillDetailsDialog: React.FC<BillDetailsDialogProps> = ({
  open,
  onClose,
  bill,
  onStatusChange
}) => {
  const [status, setStatus] = useState<BillStatus | ''>('');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (bill) {
      setStatus(bill.status);
    }
  }, [bill]);

  const handleStatusChange = async () => {
    if (!bill || !status) return;

    setIsUpdating(true);
    try {
      await billingService.updateBillStatus(bill.id!, status as BillStatus);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error updating bill status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID:
        return 'success';
      case BillStatus.PARTIALLY_PAID:
        return 'warning';
      case BillStatus.OVERDUE:
        return 'error';
      case BillStatus.CANCELLED:
        return 'error';
      default:
        return 'info';
    }
  };

  if (!open || !bill) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bill Details</Typography>
          <Chip
            label={bill.status.replace(/_/g, ' ')}
            color={getStatusColor(bill.status) as any}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          {/* Bill Info */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Bill Number</Typography>
            <Typography variant="body1" gutterBottom>{bill.billNumber}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Patient</Typography>
            <Typography variant="body1" gutterBottom>
              {bill.patient
                ? `${bill.patient.firstName} ${bill.patient.lastName}`
                : bill.patientName || 'N/A'
              }
            </Typography>

            <Typography variant="subtitle2" color="text.secondary">Hospital</Typography>
            <Typography variant="body1" gutterBottom>
              {bill.hospital?.name || bill.hospitalName || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" color="text.secondary">Bill Date</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(bill.billDate)}</Typography>

            <Typography variant="subtitle2" color="text.secondary">Due Date</Typography>
            <Typography variant="body1" gutterBottom>{formatDate(bill.dueDate)}</Typography>

            {bill.notes && (
              <>
                <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                <Typography variant="body1" gutterBottom>{bill.notes}</Typography>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Bill Items */}
        <Typography variant="h6" gutterBottom>Bill Items</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Service</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bill.billItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.serviceName}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.totalAmount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right"><strong>Subtotal</strong></TableCell>
                <TableCell align="right">{formatCurrency(bill.subTotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right"><strong>Tax</strong></TableCell>
                <TableCell align="right">{formatCurrency(bill.taxAmount)}</TableCell>
              </TableRow>
              {bill.discountAmount && Number(bill.discountAmount) > 0 && (
                  <TableCell align="right">{formatCurrency(Number(bill.discountAmount))}</TableCell>
                  <TableCell colSpan={2} />
                  <TableCell align="right"><strong>Discount</strong></TableCell>
                  <TableCell align="right">{formatCurrency(bill.discountAmount)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={2} />
                <TableCell align="right"><strong>Total Amount</strong></TableCell>
                <TableCell align="right"><strong>{formatCurrency(bill.totalAmount)}</strong></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Divider sx={{ my: 2 }} />

        {/* Payments */}
        <Typography variant="h6" gutterBottom>Payments</Typography>
        {bill.payments && bill.payments.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bill.payments.map((payment, index) => (
                  <TableRow key={payment.id || index}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{payment.paymentMethod.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{payment.reference || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right"><strong>Total Paid</strong></TableCell>
                  <TableCell align="right">{formatCurrency(bill.paidAmount)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} align="right"><strong>Balance Due</strong></TableCell>
                  <TableCell align="right"><strong>{formatCurrency(bill.balanceAmount)}</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary">No payments recorded</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Update Status */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: '200px' }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={status}
              label="Update Status"
              onChange={(e: SelectChangeEvent<string>) => setStatus(e.target.value as BillStatus)}
            >
              {Object.values(BillStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
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
