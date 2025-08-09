import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Block, blockService } from '../../services/blockService';
import { Hospital, hospitalService } from '../../services/hospitalService';

interface AddBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddBlockDialog: React.FC<AddBlockDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Omit<Block, 'id'>>({
    name: '',
    hospital_id: 0
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (err) {
      console.error('Error loading hospitals:', err);
      setError('Failed to load hospitals. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Block name is required';
    }

    if (!formData.hospital_id) {
      newErrors.hospital_id = 'Hospital is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'floorNumber' ? Number(value) : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await blockService.createBlock(formData.hospital_id, formData);
      onSuccess();
      onClose();
      setFormData({ name: '', hospital_id: 0 });
    } catch (err) {
      setError('Failed to create block. Please try again.');
      console.error('Error creating block:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Block</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth error={!!errors.hospital_id}>
              <InputLabel>Hospital</InputLabel>
              <Select
                value={formData.hospital_id.toString()}
                label="Hospital"
                name="hospital_id"
                onChange={handleSelectChange}
              >
                <MenuItem value="0">Select a hospital</MenuItem>
                {hospitals.map((hospital) => (
                  <MenuItem
                    key={hospital.id ?? 0}
                    value={(hospital.id ?? 0).toString()}
                  >
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.hospital_id && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.hospital_id}
                </Alert>
              )}
            </FormControl>

            <TextField
              required
              label="Block Name"
              name="name"
              value={formData.name}
              onChange={handleTextChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Block'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddBlockDialog;
