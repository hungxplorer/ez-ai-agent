import {
  Box,
  Flex,
  Text,
  Input,
  Select,
  FormControl,
  FormLabel,
  IconButton,
  Button,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useState, useEffect, useRef } from 'react';
import { RequestSchema, ResponseSchema, SchemaField } from '../types';

interface SchemaBuilderProps {
  schemaType: 'request' | 'response';
  initialSchema?: RequestSchema | ResponseSchema;
  onChange?: (schema: RequestSchema | ResponseSchema) => void;
  hideDescriptions?: boolean;
}

const defaultField: SchemaField = {
  name: '',
  type: 'string',
  required: true,
  description: '',
};

const defaultRequestField: SchemaField = {
  name: 'input',
  type: 'string',
  required: true,
  description: 'Input for the agent',
};

const defaultResponseField: SchemaField = {
  name: 'output',
  type: 'string', 
  required: true,
  description: 'Output from the agent',
};

const SchemaBuilder = ({ 
  schemaType, 
  initialSchema,
  onChange,
  hideDescriptions = false
}: SchemaBuilderProps) => {
  const [schemaType_, setSchemaType] = useState<'json' | 'text'>(
    initialSchema?.type || 'json'
  );
  const [description, setDescription] = useState<string>(
    initialSchema?.description || ''
  );
  const [fields, setFields] = useState<SchemaField[]>(
    initialSchema?.fields || (schemaType === 'request' ? [defaultRequestField] : [])
  );
  
  // Ref để theo dõi việc đang cập nhật từ initialSchema
  const isUpdatingFromPropRef = useRef(false);

  // Ref để theo dõi thay đổi trước đó
  const prevSchemaRef = useRef<{
    type?: 'json' | 'text';
    description?: string;
    fields?: SchemaField[];
  }>({});

  // Ref để theo dõi loại schema trước đó
  const prevSchemaTypeRef = useRef<'json' | 'text' | null>(null);
  
  // Ref for debounce timer
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialSchema) {
      isUpdatingFromPropRef.current = true;
      setSchemaType(initialSchema.type);
      setDescription(initialSchema.description || '');
      setFields(initialSchema.fields || []);
      
      // Reset flag sau một khoảng thời gian ngắn
      setTimeout(() => {
        isUpdatingFromPropRef.current = false;
      }, 0);
    }
  }, [initialSchema]);

  useEffect(() => {
    // Chỉ gọi onChange khi không đang cập nhật từ prop và có thay đổi thực sự
    if (onChange && !isUpdatingFromPropRef.current) {
      // Kiểm tra xem có thay đổi thực sự không
      const hasTypeChanged = prevSchemaRef.current.type !== schemaType_;
      const hasDescriptionChanged = prevSchemaRef.current.description !== description;
      const hasFieldsChanged = JSON.stringify(prevSchemaRef.current.fields) !== JSON.stringify(fields);
      
      if (hasTypeChanged || hasDescriptionChanged || hasFieldsChanged) {
        console.log('Schema changed, calling onChange');
        
        // Cập nhật ref trước đó
        prevSchemaRef.current = {
          type: schemaType_,
          description,
          fields: [...fields],
        };
        
        // Gọi onChange với schema mới
        onChange({
          type: schemaType_,
          description,
          fields: schemaType_ === 'json' ? fields : undefined,
        });
      }
    }
  }, [schemaType_, description, fields, onChange]);

  const addField = () => {
    const newField = schemaType === 'request' 
      ? { ...defaultRequestField, name: `input_${fields.length + 1}` }
      : schemaType === 'response'
      ? { ...defaultResponseField, name: `output_${fields.length + 1}` }
      : { ...defaultField };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<SchemaField>) => {
    // For name and type, update immediately
    if (field.name !== undefined || field.type !== undefined) {
      setFields(
        fields.map((f, i) => (i === index ? { ...f, ...field } : f))
      );
    } else {
      // For description, use debounced update
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        setFields(
          fields.map((f, i) => (i === index ? { ...f, ...field } : f))
        );
      }, 300);
    }
  };

  useEffect(() => {
    // Kiểm tra xem có phải vừa chuyển từ text sang json không
    const switchedFromTextToJson = prevSchemaTypeRef.current === 'text' && schemaType_ === 'json';
    
    // Cập nhật ref loại schema trước đó
    prevSchemaTypeRef.current = schemaType_;
    
    // Tạo field mặc định trong các trường hợp:
    // 1. Vừa chuyển từ text sang json
    // 2. Hoặc đang ở chế độ json, không có fields, và không đang cập nhật từ prop
    if (
      (switchedFromTextToJson || (schemaType_ === 'json' && fields.length === 0)) && 
      !isUpdatingFromPropRef.current
    ) {
      console.log('Creating default fields for JSON schema');
      if (schemaType === 'request') {
        setFields([defaultRequestField]);
      } else if (schemaType === 'response') {
        // Response schema is optional
        // setFields([defaultResponseField]);
      } else {
        setFields([{ ...defaultField, name: 'data' }]);
      }
    }
    
    // Xóa fields khi chuyển sang text
    if (schemaType_ === 'text' && fields.length > 0 && !isUpdatingFromPropRef.current) {
      console.log('Clearing fields for text schema');
      setFields([]);
    }
  }, [schemaType_, fields.length, schemaType]);

  const renderFieldRow = (field: SchemaField, index: number) => {
    return (
      <Flex key={index} gap={2} mb={3} align="center">
        <FormControl flex={4}>
          <Input
            placeholder="Field name"
            value={field.name}
            onChange={(e) => updateField(index, { name: e.target.value })}
            size="sm"
          />
        </FormControl>
        
        <FormControl flex={3}>
          <Select
            value={field.type}
            onChange={(e) => updateField(index, { type: e.target.value as SchemaField['type'] })}
            size="sm"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
          </Select>
        </FormControl>
        
        <IconButton
          aria-label="Remove field"
          icon={<DeleteIcon />}
          onClick={() => removeField(index)}
          size="sm"
          variant="ghost"
          colorScheme="red"
        />
      </Flex>
    );
  };

  const renderFieldWithDescription = (field: SchemaField, index: number) => {
    return (
      <Box key={index} mb={4} p={3} borderWidth="1px" borderRadius="md" borderColor="gray.200">
        {renderFieldRow(field, index)}
        
        {!hideDescriptions && (
          <FormControl mt={2}>
            <Input
              placeholder="Field description (optional)"
              defaultValue={field.description || ''}
              onChange={(e) => {
                // Clear any existing timeout
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current);
                }
                
                // Set a new timeout
                debounceTimerRef.current = setTimeout(() => {
                  updateField(index, { description: e.target.value });
                }, 100);
              }}
              size="sm"
            />
          </FormControl>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Flex mb={4} gap={2} align="center">
        <FormControl>
          <FormLabel fontSize="sm">Schema Type</FormLabel>
          <Select
            value="json"
            isDisabled={true}
            size="sm"
          >
            <option value="json">JSON</option>
          </Select>
        </FormControl>
      </Flex>
      
      <Box>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" fontWeight="medium">Fields</Text>
          <Button
            size="xs"
            leftIcon={<AddIcon />}
            onClick={addField}
            colorScheme="blue"
            variant="outline"
          >
            Add Field
          </Button>
        </Flex>
        
        {fields.map((field, index) => renderFieldWithDescription(field, index))}
        
        {fields.length === 0 && (
          <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
            No fields defined. Click "Add Field" to create one.
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default SchemaBuilder; 