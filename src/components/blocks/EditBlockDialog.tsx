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

interface EditBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  block: Block | null;
}

interface EditBlockFormData {
  name: string;
  floorNumber: number;
  hospital_id: number;
}

const EditBlockDialog: React.FC<EditBlockDialogProps> = ({
  open,
  onClose,
  onSuccess,
  block
}) => {
  const [formData, setFormData] = useState<EditBlockFormData>({
    name: '',
    floorNumber: 0,
    hospital_id: 0
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  useEffect(() => {
    if (block) {
      setFormData({
        name: block.name || '',
        floorNumber: block.floorNumber || 0,
        hospital_id: block.hospital_id || 0
      });
    }
  }, [block]);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      const hospitalsData = Array.isArray(response.data) ? response.data : [];
      setHospitals(hospitalsData);
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

    if (formData.floorNumber < 0) {
      newErrors.floorNumber = 'Floor number must be non-negative';
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

    if (!validateForm() || !block?.id) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await blockService.updateBlock(block.id, {
        ...formData,
        id: block.id
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError('Failed to update block. Please try again.');
      console.error('Error updating block:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Block</DialogTitle>
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
                value={String(formData.hospital_id || '')}
                label="Hospital"
                name="hospital_id"
                onChange={handleSelectChange}
              >
                <MenuItem value="">
                  <em>Select a hospital</em>
                </MenuItem>
                {hospitals.map((hospital) => (
                  <MenuItem
                    key={hospital.id ?? 0}
                    value={String(hospital.id ?? 0)}
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

            <TextField
              required
              label="Floor Number"
              name="floorNumber"
              type="number"
              value={formData.floorNumber}
              onChange={handleTextChange}
              error={!!errors.floorNumber}
              helperText={errors.floorNumber}
              fullWidth
              inputProps={{ min: 0 }}
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
            {isSubmitting ? 'Updating...' : 'Update Block'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditBlockDialog;
