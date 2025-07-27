import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Department, departmentService } from '../../services/departmentService';
import { Block, blockService } from '../../services/blockService';
import { Hospital, hospitalService } from '../../services/hospitalService';
import AddDepartmentDialog from './AddDepartmentDialog';
import EditDepartmentDialog from './EditDepartmentDialog';

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<number | ''>('');
  const [selectedBlock, setSelectedBlock] = useState<number | ''>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadHospitals();
    loadDepartments();
  }, []);

  const loadHospitals = async () => {
    try {
      const response = await hospitalService.getAllHospitals();
      setHospitals(response.data);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      setErrorMessage('Failed to load hospitals');
    }
  };

  const loadBlocks = async (hospital_id: number) => {
    try {
      const response = await blockService.getBlocksByHospital(hospital_id);
      setBlocks(response.data);
    } catch (error) {
      console.error('Error loading blocks:', error);
      setErrorMessage('Failed to load blocks');
    }
  };

  const loadDepartments = async () => {
    try {
      if (selectedHospital) {
        const response = await departmentService.getAllDepartments(selectedHospital as number);
        setDepartments(response.data);
      } else {
        // If no hospital is selected, clear the departments list
        // since departments are hospital-specific
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setErrorMessage('Failed to load departments');
    }
  };

  const loadDepartmentsByBlock = async (block_id: number) => {
    try {
      const response = await departmentService.getDepartmentsByBlock(block_id);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error loading departments by block:', error);
      setErrorMessage('Failed to load departments for selected block');
    }
  };

  const handleHospitalChange = (event: any) => {
    const hospitalId = event.target.value;
    setSelectedHospital(hospitalId);
    setSelectedBlock('');
    if (hospitalId) {
      loadBlocks(hospitalId);
    } else {
      setBlocks([]);
    }
    loadDepartments(); // Load departments regardless of hospital selection
  };

  const handleBlockChange = (event: any) => {
    const blockId = event.target.value;
    setSelectedBlock(blockId);
    if (blockId) {
      loadDepartmentsByBlock(blockId);
    } else if (selectedHospital) {
      // If no block is selected but hospital is selected, load hospital's departments
      loadDepartments();
    } else {
      // If neither block nor hospital is selected, load all departments
      loadDepartments();
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await departmentService.deleteDepartment(id);
      if (selectedBlock) {
        loadDepartmentsByBlock(selectedBlock as number);
      } else {
        loadDepartments();
      }
      setSuccessMessage('Department deleted successfully');
    } catch (error) {
      console.error('Error deleting department:', error);
      setErrorMessage('Failed to delete department');
    }
  };

  const handleAddSuccess = () => {
    if (selectedBlock) {
      loadDepartmentsByBlock(selectedBlock as number);
    } else {
      loadDepartments();
    }
    setSuccessMessage('Department added successfully');
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    if (selectedBlock) {
      loadDepartmentsByBlock(selectedBlock as number);
    } else {
      loadDepartments();
    }
    setSuccessMessage('Department updated successfully');
  };

  const getBlockName = (block_id: number) => {
    const block = blocks.find(b => b.id === block_id);
    return block ? block.name : 'Unknown Block';
  };

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Filter by Hospital</InputLabel>
          <Select
            value={selectedHospital}
            label="Filter by Hospital"
            onChange={handleHospitalChange}
          >
            <MenuItem value="">
              <em>All Hospitals</em>
            </MenuItem>
            {hospitals.map((hospital) => (
              <MenuItem key={hospital.id} value={hospital.id}>
                {hospital.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedHospital && (
          <FormControl fullWidth>
            <InputLabel>Filter by Block</InputLabel>
            <Select
              value={selectedBlock}
              label="Filter by Block"
              onChange={handleBlockChange}
            >
              <MenuItem value="">
                <em>All Blocks</em>
              </MenuItem>
              {blocks.map((block) => (
                <MenuItem key={block.id} value={block.id}>
                  {block.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Button
          variant="contained"
          color="primary"
          style={{ margin: '16px' }}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Department
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Block</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>{department.name}</TableCell>
                <TableCell>{getBlockName(department.block_id)}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(department)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => department.id && handleDelete(department.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddDepartmentDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <EditDepartmentDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onSuccess={handleEditSuccess}
        department={selectedDepartment}
      />

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DepartmentList;
