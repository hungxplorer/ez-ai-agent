import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Text,
  VStack,
  HStack,
  IconButton,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Tooltip,
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
    initialSchema?.fields || []
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
    setFields([...fields, { ...defaultField, name: `field${fields.length + 1}` }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, field: Partial<SchemaField>) => {
    setFields(
      fields.map((f, i) => (i === index ? { ...f, ...field } : f))
    );
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
      setFields([{ ...defaultField, name: 'field1' }]);
    }
    
    // Xóa fields khi chuyển sang text
    if (schemaType_ === 'text' && fields.length > 0 && !isUpdatingFromPropRef.current) {
      console.log('Clearing fields for text schema');
      setFields([]);
    }
  }, [schemaType_, fields.length]);

  return (
    <Box>
      <HStack spacing={4} mb={3}>
        <FormControl flex="1">
          <FormLabel fontSize="xs">Type</FormLabel>
          <Select
            size="sm"
            value={schemaType_}
            onChange={(e) => setSchemaType(e.target.value as 'json' | 'text')}
          >
            <option value="json">JSON</option>
            <option value="text">Plain Text</option>
          </Select>
        </FormControl>

        {!hideDescriptions && (
          <FormControl flex="2">
            <FormLabel fontSize="xs">Description</FormLabel>
            <Input
              size="sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Describe the ${schemaType} schema...`}
            />
          </FormControl>
        )}
      </HStack>

      {schemaType_ === 'json' && (
        <Box>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="xs" fontWeight="medium">Fields</Text>
            <Tooltip label="Add Field">
              <IconButton
                aria-label="Add field"
                icon={<AddIcon />}
                size="xs"
                onClick={addField}
                colorScheme="blue"
                variant="ghost"
              />
            </Tooltip>
          </Flex>

          {fields.length === 0 ? (
            <Text fontSize="xs" color="gray.500" textAlign="center" py={2}>
              No fields defined. Click "+" to add fields.
            </Text>
          ) : (
            <Accordion allowMultiple size="sm" defaultIndex={[0]}>
              {fields.map((field, index) => (
                <AccordionItem key={index} borderWidth="1px" borderRadius="md" mb={2} borderColor="gray.200">
                  <h2>
                    <AccordionButton py={1}>
                      <Box flex="1" textAlign="left" fontSize="sm">
                        {field.name || `Field ${index + 1}`}
                        {field.required && (
                          <Text as="span" color="red.500" ml={1}>
                            *
                          </Text>
                        )}
                      </Box>
                      <Badge size="sm" colorScheme="blue" mr={2}>
                        {field.type}
                      </Badge>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={2} pt={2}>
                    <VStack spacing={2} align="stretch">
                      <HStack spacing={2}>
                        <FormControl flex="3">
                          <FormLabel fontSize="xs" mb={0}>Name</FormLabel>
                          <Input
                            size="xs"
                            value={field.name}
                            onChange={(e) =>
                              updateField(index, { name: e.target.value })
                            }
                          />
                        </FormControl>

                        <FormControl flex="2">
                          <FormLabel fontSize="xs" mb={0}>Type</FormLabel>
                          <Select
                            size="xs"
                            value={field.type}
                            onChange={(e) =>
                              updateField(index, {
                                type: e.target.value as SchemaField['type'],
                              })
                            }
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="object">Object</option>
                            <option value="array">Array</option>
                          </Select>
                        </FormControl>
                      </HStack>

                      {!hideDescriptions && (
                        <FormControl>
                          <FormLabel fontSize="xs" mb={0}>Description</FormLabel>
                          <Input
                            size="xs"
                            value={field.description || ''}
                            onChange={(e) =>
                              updateField(index, { description: e.target.value })
                            }
                          />
                        </FormControl>
                      )}

                      <Flex justify="space-between" align="center">
                        <FormControl display="flex" alignItems="center">
                          <Switch
                            size="sm"
                            isChecked={field.required}
                            onChange={(e) =>
                              updateField(index, { required: e.target.checked })
                            }
                            mr={1}
                          />
                          <FormLabel fontSize="xs" mb={0}>
                            Required
                          </FormLabel>
                        </FormControl>

                        <IconButton
                          aria-label="Remove field"
                          icon={<DeleteIcon />}
                          size="xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeField(index)}
                        />
                      </Flex>
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SchemaBuilder; 