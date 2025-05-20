import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const DummyRadioButtonData = {
  radio1: {
    optional: false,
    values: {
      value1: 'value1',
      value2: 'value2',
      value3: 'value3',
    }
  },
  radio2: {
    optional: true,
    values: {
      value1: 'value1',
      value2: 'value2',
      value3: 'value3',
    }
  },
  radio3: {
    optional: false,
    values: {
      value1: 'value1',
      value2: 'value2',
      value3: 'value3',
    }
  },
  radio4: {
    optional: true,
    values: {
      value1: 'value1',
      value2: 'value2',
      value3: 'value3',
    }
  }
}

// ラジオボタンのキーに基づいてオプショナルなスキーマを生成
const initialRadioGroupSchema = Object.keys(DummyRadioButtonData).reduce((acc, key) => {
  return { ...acc, [key]: z.string().optional() };
}, {} as Record<keyof typeof DummyRadioButtonData, z.ZodOptional<z.ZodString>>);

const partielleSchema = z.object({
  text1: z.string().min(1, { message: '入力必須です' }),
  text2: z.string().optional(),
  text3: z.string().optional(),
  dynamicFields: z.array(
    z.object({
      value: z.string().min(1, { message: '入力必須です' }),
    })
  ),
  isRadioButtonVisible: z.boolean(),
  ...initialRadioGroupSchema,
}).superRefine((data, ctx) => {
  if (!data.isRadioButtonVisible) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '「Radioボタンを表示」ボタンを押してください。',
      path: ['isRadioButtonVisible'],
    });
  } else {
    Object.entries(DummyRadioButtonData).forEach(([key, config]) => {
      if (!config.optional && !data[key as keyof typeof data]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '選択必須です',
          path: [key],
        });
      }
    });
  }
});

type FormValues = z.infer<typeof partielleSchema>;

const defaultRadioValues = Object.keys(DummyRadioButtonData).reduce((acc, key) => {
  return { ...acc, [key]: '' };
}, {} as { [K in keyof typeof DummyRadioButtonData]: string });

function App() {
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [showRadioButtons, setShowRadioButtons] = useState(false); // ラジオボタン表示状態

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(partielleSchema),
    defaultValues: {
      text1: '',
      text2: '',
      text3: '',
      dynamicFields: [],
      isRadioButtonVisible: false, // 初期値はfalse
      ...defaultRadioValues,
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: 'dynamicFields',
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    setSubmitStatus('success');
  };

  const onError = () => {
    setSubmitStatus('error');
  };

  const handleShowRadioClick = () => {
    setShowRadioButtons(true);
    setValue('isRadioButtonVisible', true, { shouldValidate: true });
    // isRadioButtonVisible を true に設定後、ラジオボタンフィールドも再検証トリガー
    Object.keys(DummyRadioButtonData).forEach(key => {
        trigger(key as keyof FormValues);
    });
  };

  return (
    <>
      <h1>動的フォームサンプル</h1>
      {submitStatus === 'success' && <p style={{ color: 'green' }}>送信に成功しました</p>}
      {submitStatus === 'error' && <p style={{ color: 'red' }}>送信に失敗しました</p>}

      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div>
          <label htmlFor="text1">テキスト1 (必須):</label>
          <input id="text1" {...register('text1')} />
          {errors.text1 && <p>{errors.text1.message}</p>}
        </div>

        <div>
          <label htmlFor="text2">テキスト2:</label>
          <input id="text2" {...register('text2')} />
          {errors.text2 && <p>{errors.text2.message}</p>}
        </div>

        <div>
          <label htmlFor="text3">テキスト3:</label>
          <input id="text3" {...register('text3')} />
          {errors.text3 && <p>{errors.text3.message}</p>}
        </div>

        {/* Radioボタン表示ボタン */} 
        {!showRadioButtons && (
          <div>
            <button type="button" onClick={handleShowRadioClick}>
              Radioボタンを表示
            </button>
            {errors.isRadioButtonVisible && (
              <p style={{ color: 'red' }}>{errors.isRadioButtonVisible.message}</p>
            )}
          </div>
        )}

        {/* ラジオボタングループのレンダリング (showRadioButtonsがtrueの場合のみ) */} 
        {showRadioButtons && Object.entries(DummyRadioButtonData).map(([groupKey, groupData]) => (
          <div key={groupKey}>
            <p>{`ラジオグループ ${groupKey.replace('radio', '')}${groupData.optional ? '' : ' (必須)'}`}:</p>
            {Object.entries(groupData.values).map(([valueKey, displayValue]) => (
              <label key={valueKey} htmlFor={`${groupKey}-${valueKey}`}>
                <input
                  type="radio"
                  id={`${groupKey}-${valueKey}`}
                  value={valueKey}
                  {...register(groupKey as keyof FormValues)}
                />
                {displayValue}
              </label>
            ))}
            {errors[groupKey as keyof FormValues] && (
              <p style={{ color: 'red' }}>{(errors[groupKey as keyof FormValues] as any)?.message}</p>
            )}
          </div>
        ))}

        {fields.map((field, index) => (
          <div key={field.id}>
            <label htmlFor={`dynamicFields.${index}.value`}>
              追加テキスト {index + 1} (必須):
            </label>
            <Controller
              name={`dynamicFields.${index}.value`}
              control={control}
              defaultValue=""
              render={({ field: controllerField }) => (
                <input {...controllerField} />
              )}
            />
            {errors.dynamicFields?.[index]?.value && (
              <p>{errors.dynamicFields?.[index]?.value?.message}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => append({ value: '' })}
        >
          フォームを追加
        </button>

        <button type="submit">送信</button>
      </form>
    </>
  );
}

export default App;
