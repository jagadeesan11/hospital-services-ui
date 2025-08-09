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
  SelectChangeEvent,
  Tabs,
  Tab,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
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

interface BulkDepartment {
  name: string;
  blockName: string;
  block_id?: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
}

const AddDepartmentDialog: React.FC<AddDepartmentDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(0);
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

  // Bulk upload states
  const [bulkDepartments, setBulkDepartments] = useState<BulkDepartment[]>([]);
  const [bulkSelectedHospital, setBulkSelectedHospital] = useState<number>(0);
  const [bulkBlocks, setBulkBlocks] = useState<Block[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  const [bulkError, setBulkError] = useState<string>('');

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

      await departmentService.createDepartmentByHospitalBlock(selectedHospital, formData.block_id, departmentData);
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

  // Bulk upload methods
  const handleBulkHospitalChange = async (e: SelectChangeEvent<number>) => {
    const hospitalId = Number(e.target.value);
    setBulkSelectedHospital(hospitalId);
    if (hospitalId) {
      try {
        const response = await blockService.getBlocksByHospital(hospitalId);
        setBulkBlocks(response.data);
        // Update block_id for existing departments based on block names
        setBulkDepartments(prev => prev.map(dept => {
          const block = response.data.find((b: Block) => b.name === dept.blockName);
          return {
            ...dept,
            block_id: block?.id || undefined,
            status: block ? dept.status : 'error',
            error: block ? dept.error : 'Block not found'
          };
        }));
      } catch (err) {
        console.error('Error loading blocks for bulk upload:', err);
        setBulkError('Failed to load blocks');
      }
    } else {
      setBulkBlocks([]);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setBulkError('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvContent = e.target?.result as string;
      const lines = csvContent.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setBulkError('CSV file must contain at least a header and one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const nameIndex = headers.indexOf('name') >= 0 ? headers.indexOf('name') : headers.indexOf('department name');
      const blockIndex = headers.indexOf('block') >= 0 ? headers.indexOf('block') : headers.indexOf('block name');

      if (nameIndex === -1) {
        setBulkError('CSV must contain a "Name" or "Department Name" column');
        return;
      }

      if (blockIndex === -1) {
        setBulkError('CSV must contain a "Block" or "Block Name" column');
        return;
      }

      setBulkError('');
      const departments: BulkDepartment[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= Math.max(nameIndex + 1, blockIndex + 1)) {
          const name = values[nameIndex]?.replace(/"/g, '') || '';
          const blockName = values[blockIndex]?.replace(/"/g, '') || '';

          if (name && blockName) {
            departments.push({
              name,
              blockName,
              status: 'pending'
            });
          }
        }
      }

      setBulkDepartments(departments);

      // If hospital is already selected, try to match blocks
      if (bulkSelectedHospital && bulkBlocks.length > 0) {
        setBulkDepartments(deps => deps.map(dept => {
          const block = bulkBlocks.find(b => b.name === dept.blockName);
          return {
            ...dept,
            block_id: block?.id,
            status: block ? 'pending' : 'error',
            error: block ? undefined : 'Block not found'
          };
        }));
      }
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = 'Name,Block Name\nCardiology,Block A\nNeurology,Block B\nOrthopedics,Block A';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'department_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const removeBulkDepartment = (index: number) => {
    setBulkDepartments(prev => prev.filter((_, i) => i !== index));
  };

  const handleBulkSubmit = async () => {
    if (!bulkSelectedHospital) {
      setBulkError('Please select a hospital');
      return;
    }

    const validDepartments = bulkDepartments.filter(dept => dept.block_id && dept.status !== 'error');
    if (validDepartments.length === 0) {
      setBulkError('No valid departments to upload');
      return;
    }

    setIsBulkSubmitting(true);
    setBulkError('');

    try {
      const results = await Promise.allSettled(
        validDepartments.map(async (dept) => {
          const departmentData = {
            name: dept.name,
            block_id: dept.block_id!,
            hospital_id: bulkSelectedHospital
          };
          return departmentService.createDepartmentByHospitalBlock(
            bulkSelectedHospital,
            dept.block_id!,
            departmentData
          );
        })
      );

      // Update status based on results
      let resultIndex = 0;
      let successCount = 0;
      let errorCount = 0;

      setBulkDepartments(prev => prev.map((dept) => {
        // Only process departments that were actually submitted (valid ones)
        if (dept.block_id && dept.status !== 'error') {
          const result = results[resultIndex];
          resultIndex++;

          if (result && result.status === 'fulfilled') {
            successCount++;
            return { ...dept, status: 'success' as const };
          } else {
            errorCount++;
            return {
              ...dept,
              status: 'error' as const,
              error: result?.status === 'rejected' ? 'Failed to create department' : 'Unknown error'
            };
          }
        }
        // Return unchanged for departments that weren't submitted
        return dept;
      }));

      if (successCount > 0) {
        onSuccess();
        if (errorCount === 0) {
          // All successful, close dialog after a short delay
          setTimeout(() => {
            onClose();
            setBulkDepartments([]);
            setBulkSelectedHospital(0);
          }, 2000);
        }
      }

    } catch (err) {
      setBulkError('Failed to upload departments. Please try again.');
      console.error('Error in bulk upload:', err);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  const renderSingleDepartmentForm = () => (
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
  );

  const renderBulkUploadForm = () => (
    <>
      <DialogContent>
        {bulkError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {bulkError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Hospital</InputLabel>
            <Select
              value={bulkSelectedHospital}
              label="Hospital"
              onChange={handleBulkHospitalChange}
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

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={downloadTemplate}
              size="small"
            >
              Download Template
            </Button>

            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              size="small"
            >
              Upload CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Upload a CSV file with columns: "Name" and "Block Name". Make sure the block names match existing blocks in the selected hospital.
          </Typography>
        </Box>

        {bulkDepartments.length > 0 && (
          <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Department Name</TableCell>
                  <TableCell>Block Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkDepartments.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>{dept.blockName}</TableCell>
                    <TableCell>
                      <Chip
                        label={dept.status === 'pending' ? 'Ready' : dept.status}
                        color={
                          dept.status === 'success' ? 'success' :
                          dept.status === 'error' ? 'error' : 'default'
                        }
                        size="small"
                      />
                      {dept.error && (
                        <Typography variant="caption" color="error" display="block">
                          {dept.error}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeBulkDepartment(index)}
                        disabled={isBulkSubmitting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleBulkSubmit}
          disabled={isBulkSubmitting || bulkDepartments.length === 0 || !bulkSelectedHospital}
        >
          {isBulkSubmitting ? 'Uploading...' : `Upload ${bulkDepartments.filter(d => d.status !== 'error').length} Departments`}
        </Button>
      </DialogActions>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Add Departments
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Single Department" />
            <Tab label="Bulk Upload" />
          </Tabs>
        </Box>
      </DialogTitle>

      {activeTab === 0 ? renderSingleDepartmentForm() : renderBulkUploadForm()}
    </Dialog>
  );
};

export default AddDepartmentDialog;
