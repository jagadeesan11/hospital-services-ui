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
import { Department, departmentService } from '../../services/departmentService';
import { Block, blockService } from '../../services/blockService';
import { Hospital, hospitalService } from '../../services/hospitalService';

interface AddDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AddDepartmentFormData {
  name: string;
  block_id: number;
}

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<Omit<Department, 'id'>>({
    name: '',
    block_id: 0,
    hospital_id: 0
  });
  const [selectedHospital, setSelectedHospital] = useState<number>(0);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHospitals();
  }, []);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      const hospitalsData = Array.isArray(response.data) ? response.data : [];
      setHospitals(hospitalsData);
    } catch (err) {
      console.error('Error loading hospitals:', err);
      setError('Failed to load hospitals');
    }
  };

  const loadBlocks = async (hospital_id: number) => {
    try {
      const response = await blockService.getBlocksByHospital(hospital_id);
      setBlocks(response.data);
    } catch (err) {
      console.error('Error loading blocks:', err);
      setError('Failed to load blocks');
    }
  };

  const handleHospitalChange = async (e: SelectChangeEvent<number>) => {
    const hospitalId = Number(e.target.value);
    setSelectedHospital(hospitalId);
    setFormData(prev => ({ ...prev, block_id: 0 }));
    if (hospitalId) {
      await loadBlocks(hospitalId);
    } else {
      setBlocks([]);
    }
  };

  const handleBlockChange = (e: SelectChangeEvent) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    }

    if (!formData.block_id) {
      newErrors.block_id = 'Block is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Create the department data with hospital_id included
      const departmentData = {
        ...formData,
        hospital_id: selectedHospital
      };

      await departmentService.createDepartment({
        department: departmentData,
        hospital_id: selectedHospital
      });
      onSuccess();
      onClose();
      setFormData({ name: '', block_id: 0, hospital_id: 0 });
    } catch (err) {
      setError('Failed to create department. Please try again.');
      console.error('Error creating department:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Department</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Hospital</InputLabel>
              <Select
                value={selectedHospital}
                label="Hospital"
                onChange={handleHospitalChange}
              >
                <MenuItem value={0}>
                  <em>Select a hospital</em>
                </MenuItem>
                {hospitals.map((hospital) => (
                  <MenuItem
                    key={hospital.id}
                    value={hospital.id}
                  >
                    {hospital.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.block_id}>
              <InputLabel>Block</InputLabel>
              <Select
                value={String(formData.block_id)}
                label="Block"
                name="block_id"
                onChange={handleBlockChange}
                disabled={!selectedHospital}
              >
                <MenuItem value="0">
                  <em>Select a block</em>
                </MenuItem>
                {blocks.map((block) => (
                  <MenuItem
                    key={block.id}
                    value={String(block.id)}
                  >
                    {block.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.block_id && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.block_id}
                </Alert>
              )}
            </FormControl>

            <TextField
              required
              label="Department Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
            {isSubmitting ? 'Creating...' : 'Create Department'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddDepartmentDialog;
