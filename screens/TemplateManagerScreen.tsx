import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Card, Button, Input, ButtonGroup } from '@rneui/themed';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../src/lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Template {
  id: string;
  template_name: string;
  subject_template: string;
  body_template: string;
  sms_template: string;
  variables: string[];
  is_default: boolean;
}

interface TemplateFormData {
  template_name: string;
  subject_template: string;
  body_template: string;
  sms_template: string;
}

export const TemplateManagerScreen: React.FC = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplateType, setSelectedTemplateType] = useState(0);

  const templateTypes = ['Email', 'SMS', 'Both'];

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<TemplateFormData>({
    defaultValues: {
      template_name: '',
      subject_template: '',
      body_template: '',
      sms_template: '',
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('invitation_templates')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const saveTemplate = async (formData: TemplateFormData) => {
    try {
      const templateData = {
        template_name: formData.template_name,
        subject_template: formData.subject_template,
        body_template: formData.body_template,
        sms_template: formData.sms_template,
        variables: extractVariables(formData.body_template + ' ' + formData.sms_template),
        created_by: user?.id,
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('invitation_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('invitation_templates')
          .insert(templateData);

        if (error) throw error;
      }

      setModalVisible(false);
      reset();
      setEditingTemplate(null);
      fetchTemplates();
      Alert.alert('Success', 'Template saved successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const extractVariables = (text: string): string[] => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = text.match(variableRegex) || [];
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))];
  };

  const editTemplate = (template: Template) => {
    setEditingTemplate(template);
    setValue('template_name', template.template_name);
    setValue('subject_template', template.subject_template);
    setValue('body_template', template.body_template);
    setValue('sms_template', template.sms_template);
    setModalVisible(true);
  };

  const deleteTemplate = async (templateId: string) => {
    Alert.alert(
      'Delete Template',
      'Are you sure you want to delete this template?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('invitation_templates')
                .delete()
                .eq('id', templateId);

              if (error) throw error;
              fetchTemplates();
              Alert.alert('Success', 'Template deleted successfully!');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const previewTemplate = (template: Template) => {
    const sampleData = {
      guest_name: 'John Doe',
      event_name: 'VIP Night Party',
      event_date: 'Saturday, Dec 25th',
      event_time: '9:00 PM',
      venue: 'Skylite Club, Nagpur',
      rsvp_link: 'https://yourapp.com/rsvp/sample'
    };

    let preview = template.body_template;
    Object.keys(sampleData).forEach(key => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), sampleData[key as keyof typeof sampleData]);
    });

    Alert.alert('Template Preview', preview);
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <Card containerStyle={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.template_name}</Text>
          <Text style={styles.templateSubject}>{item.subject_template}</Text>
          <View style={styles.variablesContainer}>
            {item.variables.map(variable => (
              <Text key={variable} style={styles.variable}>
                {`{{${variable}}}`}
              </Text>
            ))}
          </View>
        </View>
        {item.is_default && (
          <Text style={styles.defaultBadge}>DEFAULT</Text>
        )}
      </View>

      <View style={styles.templateActions}>
        <Button
          title="Preview"
          size="sm"
          buttonStyle={styles.previewButton}
          onPress={() => previewTemplate(item)}
        />
        <Button
          title="Edit"
          size="sm"
          buttonStyle={styles.editButton}
          onPress={() => editTemplate(item)}
        />
        <Button
          title="Delete"
          size="sm"
          buttonStyle={styles.deleteButton}
          onPress={() => deleteTemplate(item.id)}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Email & SMS Templates</Text>
        <Button
          title="New Template"
          onPress={() => setModalVisible(true)}
          buttonStyle={styles.newButton}
        />
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={renderTemplateItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No templates created yet</Text>
        }
      />

      {/* Template Editor Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingTemplate(null);
          reset();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTemplate ? 'Edit Template' : 'New Template'}
            </Text>
            <Button
              title="Cancel"
              type="clear"
              onPress={() => {
                setModalVisible(false);
                setEditingTemplate(null);
                reset();
              }}
            />
          </View>

          <ScrollView style={styles.form}>
            <Controller
              control={control}
              name="template_name"
              rules={{ required: 'Template name is required' }}
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Template Name *"
                  value={value}
                  onChangeText={onChange}
                  errorMessage={errors.template_name?.message}
                />
              )}
            />

            <Text style={styles.fieldLabel}>Template Type</Text>
            <ButtonGroup
              buttons={templateTypes}
              selectedIndex={selectedTemplateType}
              onPress={setSelectedTemplateType}
              containerStyle={styles.buttonGroup}
            />

            {(selectedTemplateType === 0 || selectedTemplateType === 2) && (
              <>
                <Controller
                  control={control}
                  name="subject_template"
                  rules={{ required: selectedTemplateType === 0 || selectedTemplateType === 2 ? 'Subject is required for email templates' : false }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Email Subject *"
                      value={value}
                      onChangeText={onChange}
                      errorMessage={errors.subject_template?.message}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="body_template"
                  rules={{ required: selectedTemplateType !== 1 ? 'Email body is required' : false }}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      placeholder="Email Body *"
                      value={value}
                      onChangeText={onChange}
                      multiline
                      numberOfLines={6}
                      errorMessage={errors.body_template?.message}
                    />
                  )}
                />
              </>
            )}

            {(selectedTemplateType === 1 || selectedTemplateType === 2) && (
              <Controller
                control={control}
                name="sms_template"
                rules={{ required: selectedTemplateType === 1 ? 'SMS message is required' : false }}
                render={({ field: { onChange, value } }) => (
                  <Input
                    placeholder="SMS Message *"
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={3}
                    errorMessage={errors.sms_template?.message}
                  />
                )}
              />
            )}

            <View style={styles.variablesHelp}>
              <Text style={styles.helpTitle}>Available Variables:</Text>
              <Text style={styles.helpText}>
                Use these placeholders in your templates:
                {'\n'}• {`{{guest_name}}`} - Guest's name
                {'\n'}• {`{{event_name}}`} - Event name  
                {'\n'}• {`{{event_date}}`} - Event date
                {'\n'}• {`{{event_time}}`} - Event time
                {'\n'}• {`{{venue}}`} - Event venue
                {'\n'}• {`{{rsvp_link}}`} - RSVP confirmation link
              </Text>
            </View>

            <Button
              title={editingTemplate ? 'Update Template' : 'Create Template'}
              onPress={handleSubmit(saveTemplate)}
              buttonStyle={styles.submitButton}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
  },
  listContainer: {
    padding: 15,
  },
  templateCard: {
    borderRadius: 10,
    marginVertical: 5,
    padding: 15,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  templateSubject: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  variablesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  variable: {
    fontSize: 10,
    backgroundColor: '#e9ecef',
    color: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  defaultBadge: {
    fontSize: 10,
    backgroundColor: '#FFD700',
    color: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  templateActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 15,
    height: 32,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    height: 32,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    height: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  buttonGroup: {
    marginBottom: 20,
  },
  variablesHelp: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    height: 50,
    marginTop: 20,
  },
});
