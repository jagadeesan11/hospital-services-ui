import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, FormControl, InputLabel, Select,
  MenuItem, FormHelperText, Box, CircularProgress
} from '@mui/material';
import { Bill, BillPayment, PaymentMethod, billingService } from '../../services/billingService';

interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill: Bill | null;
}

const AddPaymentDialog: React.FC<AddPaymentDialogProps> = ({
  open,
  onClose,
  onSuccess,
  bill
}) => {
  const initialFormState: BillPayment = {
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    reference: '',
    notes: ''
  };

  const [formData, setFormData] = useState<BillPayment>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (bill && bill.balanceAmount) {
      setFormData(prev => ({
        ...prev,
        amount: bill.balanceAmount
      }));
    }
  }, [bill]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Clear error for this field if any
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
// Adding a specific handler for Select components to fix type issues
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    if (name && formData) {
      setFormData({ ...formData, [name]: value });

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name) {
      const numValue = parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: isNaN(numValue) ? 0 : numValue }));

      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Payment amount must be greater than 0';
    }

    if (bill && formData.amount > bill.balanceAmount) {
      newErrors.amount = `Payment cannot exceed balance due (${bill.balanceAmount})`;
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    if (formData.paymentMethod !== PaymentMethod.CASH && !formData.reference) {
      newErrors.reference = 'Reference is required for non-cash payments';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !bill?.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      await billingService.addPayment(bill.id, formData);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error adding payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  const handleDialogClose = () => {
    resetForm();
    onClose();
  };

  if (!bill) return null;

  return (
    <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="amount"
              label="Payment Amount"
              type="number"
              value={formData.amount}
              onChange={handleNumberChange}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.01 }}
              error={!!errors.amount}
              helperText={errors.amount || `Balance due: ${bill.balanceAmount}`}
            />

            <FormControl fullWidth required error={!!errors.paymentMethod}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleSelectChange}
                label="Payment Method"
              >
                {Object.values(PaymentMethod).map((method) => (
                  <MenuItem key={method} value={method}>
                    {method.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
              {errors.paymentMethod && <FormHelperText>{errors.paymentMethod}</FormHelperText>}
            </FormControl>

            <TextField
              name="paymentDate"
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{
                shrink: true,
              }}
              error={!!errors.paymentDate}
              helperText={errors.paymentDate}
            />

            <TextField
              name="reference"
              label="Reference/Transaction ID"
              value={formData.reference || ''}
              onChange={handleChange}
              fullWidth
              required={formData.paymentMethod !== PaymentMethod.CASH}
              error={!!errors.reference}
              helperText={errors.reference || 'Required for non-cash payments'}
            />

            <TextField
              name="notes"
              label="Notes"
              value={formData.notes || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={isSubmitting}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Add Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddPaymentDialog;
