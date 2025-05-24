import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useMemo } from 'react';

// スタイル定義
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center' as const,
    color: '#1e293b',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: '600',
  },
  statusMessage: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontWeight: '500',
    textAlign: 'center' as const,
  },
  successMessage: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '8px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: 'white',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    backgroundColor: '#f9fafb',
    resize: 'vertical' as const,
  },
  button: {
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  primaryButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
    color: 'white',
  },
  secondaryButtonHover: {
    backgroundColor: '#4b5563',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
    color: 'white',
  },
  dangerButtonHover: {
    backgroundColor: '#dc2626',
  },
  radioGroup: {
    marginBottom: '20px',
  },
  radioGroupTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px',
  },
  radioOptions: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  radioOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  radioOptionHover: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  radioInput: {
    width: '16px',
    height: '16px',
    accentColor: '#3b82f6',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.75rem',
    marginTop: '4px',
    fontWeight: '500',
  },
  dynamicField: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    marginBottom: '12px',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  dynamicFieldInput: {
    flex: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
  },
  jsonSection: {
    backgroundColor: '#1f2937',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
  },
  jsonTitle: {
    color: '#f9fafb',
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '16px',
  },
  jsonTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #374151',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontFamily: 'monospace',
    backgroundColor: '#111827',
    color: '#f9fafb',
    resize: 'vertical' as const,
    marginBottom: '12px',
  }
};

// 型定義
type RadioButtonConfig = {
  optional: boolean;
  values: Record<string, string>;
};
type RadioButtonData = Record<string, RadioButtonConfig>;

// 定数
const INITIAL_RADIO_CONFIG: RadioButtonData = {
};

const DROPDOWN_OPTIONS = [
  { value: 'option1', label: 'オプション1' },
  { value: 'option2', label: 'オプション2' },
  { value: 'option3', label: 'オプション3' },
];

const PRESERVE_FIELDS = ['text1', 'text2', 'text3', 'dropdown', 'dynamicFields'] as const;

// ヘルパー関数
const createRadioSchema = (radioData: RadioButtonData) => {
  return Object.keys(radioData).reduce((acc, key) => ({
    ...acc, 
    [key]: z.string().min(1).nullable().optional()
  }), {} as Record<string, z.ZodOptional<z.ZodNullable<z.ZodString>>>);
};

const createDefaultRadioValues = (radioData: RadioButtonData) => {
  return Object.keys(radioData).reduce((acc, key) => ({
    ...acc, 
    [key]: undefined
  }), {} as Record<string, undefined>);
};

const validateRadioButtonConfig = (data: unknown): data is RadioButtonData => {
  if (typeof data !== 'object' || data === null) return false;
  
  return Object.values(data as Record<string, unknown>).every(config => 
    typeof config === 'object' && 
    config !== null &&
    typeof (config as any).optional === 'boolean' &&
    typeof (config as any).values === 'object' &&
    (config as any).values !== null
  );
};

const mergeFormValues = (
  currentValues: Record<string, any>, 
  newDefaults: Record<string, any>
): Record<string, any> => {
  const merged = { ...newDefaults };
  
  Object.keys(currentValues).forEach(key => {
    if (PRESERVE_FIELDS.includes(key as any) && currentValues[key] !== undefined) {
      merged[key] = currentValues[key];
    } else if (key !== 'isRadioButtonVisible' && key in newDefaults && currentValues[key] !== undefined) {
      merged[key] = currentValues[key];
    }
  });
  
  if (currentValues.isRadioButtonVisible !== undefined) {
    merged.isRadioButtonVisible = currentValues.isRadioButtonVisible;
  }
  
  return merged;
};

// スキーマとデフォルト値の生成
const createFormSchemaAndDefaults = (radioData: RadioButtonData) => {
  const radioSchema = createRadioSchema(radioData);
  
  const schema = z.object({
    text1: z.string().min(1, { message: '入力必須です' }),
    text2: z.string().optional(),
    text3: z.string().optional(),
    dynamicFields: z.array(z.object({
      value: z.string().min(1, { message: '入力必須です' }),
    })),
    isRadioButtonVisible: z.boolean(),
    dropdown: z.string().min(1, { message: '選択必須です' }),
    ...radioSchema,
  }).superRefine((data, ctx) => {
    if (!data.isRadioButtonVisible) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '「Radioボタンを表示」ボタンを押してください。',
        path: ['isRadioButtonVisible'],
      });
      return;
    }
    
    Object.entries(radioData).forEach(([key, config]) => {
      if (!config.optional && !data[key as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '選択必須です',
          path: [key],
        });
      }
    });
  });

  const defaultVals = {
    text1: '',
    text2: '',
    text3: '',
    dynamicFields: [],
    isRadioButtonVisible: false,
    dropdown: '',
    ...createDefaultRadioValues(radioData),
  };

  return { schema, defaultVals };
};

type FormValues = z.infer<ReturnType<typeof createFormSchemaAndDefaults>['schema']>;

// コンポーネント
const ErrorMessage = ({ message }: { message?: string }) => 
  message ? <div style={styles.errorText}>{message}</div> : null;

const TextInput = ({ 
  id, 
  label, 
  register, 
  error,
  required = false 
}: {
  id: string;
  label: string;
  register: any;
  error?: string;
  required?: boolean;
}) => (
  <div style={styles.fieldGroup}>
    <label htmlFor={id} style={styles.label}>
      {label}{required ? ' (必須)' : ''}
    </label>
    <input 
      id={id} 
      {...register(id)} 
      style={{
        ...styles.input,
        ...(error ? { borderColor: '#dc2626' } : {})
      }}
      onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
      onBlur={(e) => Object.assign(e.target.style, { borderColor: '#d1d5db', boxShadow: 'none' })}
    />
    <ErrorMessage message={error} />
  </div>
);

const Dropdown = ({ 
  register, 
  error 
}: {
  register: any;
  error?: string;
}) => (
  <div style={styles.fieldGroup}>
    <label htmlFor="dropdown" style={styles.label}>プルダウン (必須)</label>
    <select 
      id="dropdown" 
      {...register('dropdown')} 
      style={{
        ...styles.select,
        ...(error ? { borderColor: '#dc2626' } : {})
      }}
    >
      <option value="">選択してください</option>
      {DROPDOWN_OPTIONS.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <ErrorMessage message={error} />
  </div>
);

const JsonConfigInput = ({
  value,
  onChange,
  onApply,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  error?: string;
}) => (
  <div style={styles.jsonSection}>
    <h2 style={styles.jsonTitle}>ラジオボタン設定 (JSON)</h2>
    <textarea
      rows={10}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={styles.jsonTextarea}
      placeholder={`例:
{
  "radio1": {
    "optional": false,
    "values": {
      "value1": "選択肢1",
      "value2": "選択肢2"
    }
  }
}`}
    />
    <button 
      type="button" 
      onClick={onApply}
      style={{
        ...styles.button,
        ...styles.primaryButton
      }}
      onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.primaryButtonHover)}
      onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.primaryButton)}
    >
      JSONを適用
    </button>
    <ErrorMessage message={error} />
  </div>
);

const RadioGroup = ({
  groupKey,
  groupData,
  register,
  getValues,
  setValue,
  error
}: {
  groupKey: string;
  groupData: RadioButtonConfig;
  register: any;
  getValues: any;
  setValue: any;
  error?: string;
}) => (
  <div style={styles.radioGroup}>
    <div style={styles.radioGroupTitle}>
      {`ラジオグループ ${groupKey.replace('radio', '')}${groupData.optional ? '' : ' (必須)'}`}
    </div>
    <div style={styles.radioOptions}>
      {Object.entries(groupData.values).map(([valueKey, displayValue]) => (
        <label 
          key={valueKey} 
          htmlFor={`${groupKey}-${valueKey}`}
          style={styles.radioOption}
          onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.radioOptionHover)}
          onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.radioOption)}
        >
          <input
            type="radio"
            id={`${groupKey}-${valueKey}`}
            value={valueKey}
            {...register(groupKey)}
            style={styles.radioInput}
            onClick={(e) => {
              if (groupData.optional) {
                const currentValue = getValues(groupKey);
                if (currentValue === (e.target as HTMLInputElement).value) {
                  setValue(groupKey, undefined, { shouldValidate: true });
                }
              }
            }}
          />
          <span>{displayValue}</span>
        </label>
      ))}
    </div>
    <ErrorMessage message={error} />
  </div>
);

function App() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [showRadioButtons, setShowRadioButtons] = useState(false);
  const [radioButtonJsonInput, setRadioButtonJsonInput] = useState<string>(
    JSON.stringify(INITIAL_RADIO_CONFIG, null, 2)
  );
  const [currentRadioButtonData, setCurrentRadioButtonData] = useState<RadioButtonData>(INITIAL_RADIO_CONFIG);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);

  const { schema, defaultVals } = useMemo(
    () => createFormSchemaAndDefaults(currentRadioButtonData), 
    [currentRadioButtonData]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultVals,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dynamicFields',
  });

  const handleSubmit = (data: FormValues) => {
    console.log(data);
    setSubmitStatus('success');
  };

  const handleError = () => {
    setSubmitStatus('error');
  };

  const handleApplyJson = () => {
    try {
      const parsedData = JSON.parse(radioButtonJsonInput);
      
      if (!validateRadioButtonConfig(parsedData)) {
        throw new Error("Invalid JSON structure for radio button config.");
      }

      const currentValues = form.getValues();
      const { defaultVals: newDefaults } = createFormSchemaAndDefaults(parsedData);
      const mergedValues = mergeFormValues(currentValues, newDefaults);

      setCurrentRadioButtonData(parsedData);
      setJsonParseError(null);
      form.reset(mergedValues as FormValues);
      
    } catch (error) {
      setJsonParseError(error instanceof Error ? error.message : 'Invalid JSON format');
      console.error("JSON Parse Error:", error);
    }
  };

  const handleShowRadioClick = () => {
    setShowRadioButtons(true);
    form.setValue('isRadioButtonVisible', true, { shouldValidate: true });
    Object.keys(currentRadioButtonData).forEach(key => {
      form.trigger(key as keyof FormValues);
    });
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>🚀 動的フォームサンプル</h1>
      
      {submitStatus === 'success' && (
        <div style={{ ...styles.statusMessage, ...styles.successMessage }}>
          ✅ 送信に成功しました
        </div>
      )}
      {submitStatus === 'error' && (
        <div style={{ ...styles.statusMessage, ...styles.errorMessage }}>
          ❌ 送信に失敗しました
        </div>
      )}

      <JsonConfigInput
        value={radioButtonJsonInput}
        onChange={setRadioButtonJsonInput}
        onApply={handleApplyJson}
        error={jsonParseError || undefined}
      />

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📝 フォーム入力</h2>
        <form onSubmit={form.handleSubmit(handleSubmit, handleError)}>
          <TextInput
            id="text1"
            label="テキスト1"
            register={form.register}
            error={form.formState.errors.text1?.message}
            required
          />
          
          <TextInput
            id="text2"
            label="テキスト2"
            register={form.register}
            error={form.formState.errors.text2?.message}
          />
          
          <TextInput
            id="text3"
            label="テキスト3"
            register={form.register}
            error={form.formState.errors.text3?.message}
          />

          <Dropdown
            register={form.register}
            error={form.formState.errors.dropdown?.message}
          />

          {!showRadioButtons && Object.keys(currentRadioButtonData).length > 0 && (
            <div style={styles.fieldGroup}>
              <button 
                type="button" 
                onClick={handleShowRadioClick}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton
                }}
                onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.secondaryButtonHover)}
                onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.secondaryButton)}
              >
                📻 Radioボタンを表示
              </button>
              <ErrorMessage message={form.formState.errors.isRadioButtonVisible?.message} />
            </div>
          )}

          {showRadioButtons && Object.entries(currentRadioButtonData).map(([groupKey, groupData]) => (
            <RadioGroup
              key={groupKey}
              groupKey={groupKey}
              groupData={groupData}
              register={form.register}
              getValues={form.getValues}
              setValue={form.setValue}
              error={(form.formState.errors[groupKey as keyof FormValues] as any)?.message}
            />
          ))}

          {fields.length > 0 && (
            <div>
              <h3 style={styles.sectionTitle}>➕ 動的フィールド</h3>
              {fields.map((field, index) => (
                <div key={field.id} style={styles.dynamicField}>
                  <div style={styles.dynamicFieldInput}>
                    <label style={styles.label}>
                      追加テキスト {index + 1} (必須)
                    </label>
                    <Controller
                      name={`dynamicFields.${index}.value`}
                      control={form.control}
                      defaultValue=""
                      render={({ field: controllerField }) => (
                        <input 
                          {...controllerField} 
                          style={styles.input}
                        />
                      )}
                    />
                    <ErrorMessage message={form.formState.errors.dynamicFields?.[index]?.value?.message} />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    style={{
                      ...styles.button,
                      ...styles.dangerButton
                    }}
                    onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.dangerButtonHover)}
                    onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.dangerButton)}
                  >
                    🗑️ 削除
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button 
              type="button" 
              onClick={() => append({ value: '' })}
              style={{
                ...styles.button,
                ...styles.secondaryButton
              }}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.secondaryButtonHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.secondaryButton)}
            >
              ➕ フォームを追加
            </button>

            <button 
              type="submit"
              style={{
                ...styles.button,
                ...styles.primaryButton
              }}
              onMouseOver={(e) => Object.assign(e.currentTarget.style, styles.primaryButtonHover)}
              onMouseOut={(e) => Object.assign(e.currentTarget.style, styles.primaryButton)}
            >
              🚀 送信
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
