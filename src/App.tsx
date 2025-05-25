import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

// 🔥 地獄のフォーム型定義
interface FileData {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  uploaded: boolean;
}

interface TableRow {
  id: string;
  product: string;
  quantity: number;
  price: number;
  discount: number;
  category: string;
}

interface FormStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

type FormData = {
  // Step 1: 基本情報
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: 個人情報
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  zipCode: string;
  address: string;
  phoneNumber: string;
  
  // Step 3: ファイルアップロード
  profileImage: FileData[];
  documents: FileData[];
  
  // Step 4: 動的テーブル
  orderItems: TableRow[];
  
  // Step 5: 最終確認
  agreeToTerms: boolean;
  subscribeNewsletter: boolean;
  
  // 隠しフィールド
  totalAmount: number;
  formStartTime: number;
  autoSaveEnabled: boolean;
};

// 🎨 地獄のスタイル定義
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#f1f5f9',
    minHeight: '100vh',
  },
  header: {
    textAlign: 'center' as const,
    color: '#1e293b',
    marginBottom: '30px',
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(45deg, #ef4444, #f97316, #eab308)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  step: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
    position: 'relative' as const,
  },
  stepNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginBottom: '10px',
    transition: 'all 0.3s ease',
  },
  stepActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    transform: 'scale(1.2)',
    boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)',
  },
  stepCompleted: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  stepPending: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
  },
  stepTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    textAlign: 'center' as const,
    color: '#374151',
  },
  countdown: {
    position: 'fixed' as const,
    top: '20px',
    right: '20px',
    padding: '15px 25px',
    backgroundColor: '#dc2626',
    color: 'white',
    borderRadius: '8px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    zIndex: 1000,
    animation: 'pulse 2s infinite',
    boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)',
  },
  autoSaveIndicator: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    padding: '10px 15px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.9rem',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    border: '1px solid #e2e8f0',
    position: 'relative' as const,
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fieldGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.15)',
    transform: 'translateY(-2px)',
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
  },
  inputSuccess: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginTop: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  successText: {
    color: '#10b981',
    fontSize: '0.85rem',
    marginTop: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  loadingText: {
    color: '#f59e0b',
    fontSize: '0.85rem',
    marginTop: '6px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
  },
  primaryButtonHover: {
    backgroundColor: '#2563eb',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.6)',
  },
  secondaryButton: {
    backgroundColor: '#64748b',
    color: 'white',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
    color: 'white',
  },
  successButton: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  fileUpload: {
    border: '3px dashed #cbd5e1',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center' as const,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
  },
  fileUploadActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    transform: 'scale(1.02)',
  },
  filePreview: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    marginTop: '20px',
  },
  fileItem: {
    position: 'relative' as const,
    width: '120px',
    height: '120px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'absolute' as const,
    bottom: '0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: '600',
    color: '#374151',
  },
  tableCell: {
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    textAlign: 'left' as const,
  },
  tableInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
  calculationPanel: {
    backgroundColor: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    marginTop: '20px',
  },
  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    fontSize: '1.1rem',
  },
  totalRow: {
    borderTop: '2px solid #374151',
    paddingTop: '16px',
    marginTop: '16px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  buttonGroup: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    justifyContent: 'space-between',
  },
  hiddenInput: {
    display: 'none',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #f3f4f6',
    borderTop: '2px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// 🎯 CSS Animations
const cssAnimations = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

// 📊 フォームステップ定義
const FORM_STEPS: FormStep[] = [
  { id: 1, title: 'アカウント', description: '基本認証情報', completed: false },
  { id: 2, title: '個人情報', description: '詳細プロフィール', completed: false },
  { id: 3, title: 'ファイル', description: 'ドキュメント', completed: false },
  { id: 4, title: '注文', description: '商品選択', completed: false },
  { id: 5, title: '確認', description: '最終チェック', completed: false },
];

// 🏷️ 商品カテゴリとオプション
const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: '電子機器' },
  { value: 'books', label: '書籍' },
  { value: 'clothing', label: '衣類' },
  { value: 'food', label: '食品' },
  { value: 'sports', label: 'スポーツ用品' },
];

const PRODUCTS = {
  electronics: [
    { value: 'laptop', label: 'ノートパソコン', price: 150000 },
    { value: 'smartphone', label: 'スマートフォン', price: 80000 },
    { value: 'tablet', label: 'タブレット', price: 60000 },
  ],
  books: [
    { value: 'programming', label: 'プログラミング本', price: 3000 },
    { value: 'novel', label: '小説', price: 1500 },
    { value: 'manga', label: 'マンガ', price: 500 },
  ],
  clothing: [
    { value: 'shirt', label: 'シャツ', price: 5000 },
    { value: 'pants', label: 'パンツ', price: 8000 },
    { value: 'shoes', label: '靴', price: 12000 },
  ],
  food: [
    { value: 'rice', label: 'お米', price: 2000 },
    { value: 'meat', label: '肉', price: 1000 },
    { value: 'vegetables', label: '野菜', price: 500 },
  ],
  sports: [
    { value: 'ball', label: 'ボール', price: 3000 },
    { value: 'racket', label: 'ラケット', price: 15000 },
    { value: 'shoes_sports', label: 'スポーツシューズ', price: 10000 },
  ],
};

// 🔍 バリデーションスキーマ（統合版）
const createFormSchema = () => {
  return z.object({
    // Step 1
    email: z.string().email('正しいメールアドレスを入力してください'),
    username: z.string().min(3, 'ユーザー名は3文字以上です').max(20, '20文字以内で入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上です').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '大文字・小文字・数字を含んでください'),
    confirmPassword: z.string(),
    
    // Step 2
    firstName: z.string().min(1, '名前を入力してください'),
    lastName: z.string().min(1, '苗字を入力してください'),
    birthDate: z.string().min(1, '生年月日を選択してください'),
    gender: z.string().min(1, '性別を選択してください'),
    zipCode: z.string().regex(/^\d{7}$/, '郵便番号は7桁の数字です'),
    address: z.string().min(10, '住所は10文字以上で入力してください'),
    phoneNumber: z.string().regex(/^0\d{1,4}-\d{1,4}-\d{4}$/, '正しい電話番号を入力してください'),
    
    // Step 3
    profileImage: z.array(z.any()).min(1, 'プロフィール画像をアップロードしてください'),
    documents: z.array(z.any()).min(2, '最低2つのドキュメントが必要です'),
    
    // Step 4
    orderItems: z.array(z.object({
      id: z.string(),
      product: z.string().min(1, '商品を選択してください'),
      quantity: z.number().min(1, '数量は1以上です'),
      price: z.number().min(0),
      discount: z.number().min(0).max(100, '割引率は0-100%です'),
      category: z.string().min(1, 'カテゴリを選択してください'),
    })).min(1, '最低1つの商品を追加してください'),
    
    // Step 5
    agreeToTerms: z.boolean().refine(val => val === true, '利用規約に同意してください'),
    subscribeNewsletter: z.boolean(),
    
    // Hidden fields
    totalAmount: z.number(),
    formStartTime: z.number(),
    autoSaveEnabled: z.boolean(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'パスワードが一致しません',
    path: ['confirmPassword'],
  });
};

// 🚀 メインコンポーネント
function App() {
  // 📱 State管理
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(FORM_STEPS);
  const [timeLeft, setTimeLeft] = useState(1800); // 30分
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationStates, setValidationStates] = useState<Record<string, 'loading' | 'success' | 'error' | null>>({});
  
  // 📂 Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const autoSaveIntervalRef = useRef<number | null>(null);
  
  // 🎯 フォーム設定
  const form = useForm<FormData>({
    resolver: zodResolver(createFormSchema()),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: '',
      zipCode: '',
      address: '',
      phoneNumber: '',
      profileImage: [],
      documents: [],
      orderItems: [],
      agreeToTerms: false,
      subscribeNewsletter: false,
      totalAmount: 0,
      formStartTime: Date.now(),
      autoSaveEnabled: true,
    },
    mode: 'onChange',
  });

  const { fields: orderFields, append: appendOrder, remove: removeOrder } = useFieldArray({
    control: form.control,
    name: 'orderItems',
  });

  // 📊 リアルタイム計算
  const watchedOrderItems = useWatch({ control: form.control, name: 'orderItems' });
  const totalAmount = useMemo(() => {
    if (!watchedOrderItems) return 0;
    return watchedOrderItems.reduce((total, item) => {
      const subtotal = item.quantity * item.price;
      const discountAmount = subtotal * (item.discount / 100);
      return total + (subtotal - discountAmount);
    }, 0);
  }, [watchedOrderItems]);

  // ⏰ カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          alert('⚠️ 時間切れです！フォームがリセットされます。');
          form.reset();
          setCurrentStep(1);
          return 1800;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [form]);

  // 💾 自動保存機能
  useEffect(() => {
    if (form.watch('autoSaveEnabled')) {
      autoSaveIntervalRef.current = setInterval(() => {
        const currentData = form.getValues();
        setAutoSaveStatus('saving');
        
        // 模擬保存処理
        setTimeout(() => {
          localStorage.setItem('hellForm_autoSave', JSON.stringify(currentData));
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus(null), 2000);
        }, 1000);
      }, 10000); // 10秒ごと
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [form]);

  // 🔍 非同期バリデーション
  const validateEmail = useCallback(async (email: string) => {
    if (!email) return;
    
    setValidationStates(prev => ({ ...prev, email: 'loading' }));
    
    // 模擬API呼び出し
    setTimeout(() => {
      const isValid = !email.includes('test'); // testが含まれていたら無効
      setValidationStates(prev => ({ 
        ...prev, 
        email: isValid ? 'success' : 'error' 
      }));
    }, 1500);
  }, []);

  const validateUsername = useCallback(async (username: string) => {
    if (!username || username.length < 3) return;
    
    setValidationStates(prev => ({ ...prev, username: 'loading' }));
    
    setTimeout(() => {
      const isAvailable = !['admin', 'user', 'test'].includes(username.toLowerCase());
      setValidationStates(prev => ({ 
        ...prev, 
        username: isAvailable ? 'success' : 'error' 
      }));
    }, 2000);
  }, []);

  const validateZipCode = useCallback(async (zipCode: string) => {
    if (!zipCode || zipCode.length !== 7) return;
    
    setValidationStates(prev => ({ ...prev, zipCode: 'loading' }));
    
    setTimeout(() => {
      // 模擬住所取得
      const addresses = {
        '1000001': '東京都千代田区千代田',
        '5530003': '大阪府大阪市福島区福島',
        '2310023': '神奈川県横浜市中区山下町',
      };
      
      const address = addresses[zipCode as keyof typeof addresses];
      if (address) {
        form.setValue('address', address);
        setValidationStates(prev => ({ ...prev, zipCode: 'success' }));
      } else {
        setValidationStates(prev => ({ ...prev, zipCode: 'error' }));
      }
    }, 1000);
  }, [form]);

  // 📁 ファイルアップロード処理
  const handleFileUpload = useCallback((files: FileList, type: 'profileImage' | 'documents') => {
    const newFiles: FileData[] = [];
    
    Array.from(files).forEach(file => {
      if (type === 'profileImage' && !file.type.startsWith('image/')) {
        alert('プロフィール画像は画像ファイルのみです');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('ファイルサイズは10MB以下にしてください');
        return;
      }

      const fileData: FileData = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        uploaded: false,
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileData.preview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(fileData);
    });

    // 模擬アップロード進行
    newFiles.forEach(fileData => {
      const interval = setInterval(() => {
        fileData.progress += Math.random() * 30;
        if (fileData.progress >= 100) {
          fileData.progress = 100;
          fileData.uploaded = true;
          clearInterval(interval);
        }
      }, 200);
    });

    const currentFiles = form.getValues(type) || [];
    form.setValue(type, [...currentFiles, ...newFiles]);
  }, [form]);

  // 🎯 ステップナビゲーション
  const goToStep = (step: number) => {
    if (step < currentStep || steps[step - 1].completed) {
      setCurrentStep(step);
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid && currentStep < 5) {
      setSteps(prev => prev.map((step, index) => 
        index === currentStep - 1 ? { ...step, completed: true } : step
      ));
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 📝 フォーム送信
  const onSubmit = (data: FormData) => {
    console.log('🎉 Form submitted:', data);
    alert('🎉 フォーム送信完了！地獄から解放されました！');
  };

  // 🕒 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 📱 ステップコンテンツレンダリング
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return null;
    }
  };

  // 📝 Step 1: アカウント情報
  const renderStep1 = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        🔐 アカウント情報
      </h2>
      
      <div style={styles.fieldGroup}>
        <label style={styles.label}>メールアドレス (重複チェック有り)</label>
        <input
          {...form.register('email')}
          type="email"
          style={{
            ...styles.input,
            ...(form.formState.errors.email ? styles.inputError : {}),
            ...(validationStates.email === 'success' ? styles.inputSuccess : {}),
          }}
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {validationStates.email === 'loading' && (
          <div style={styles.loadingText}>
            <div style={styles.spinner}></div>
            メールアドレスをチェック中...
          </div>
        )}
        {validationStates.email === 'success' && (
          <div style={styles.successText}>✅ 使用可能なメールアドレスです</div>
        )}
        {validationStates.email === 'error' && (
          <div style={styles.errorText}>❌ このメールアドレスは使用できません</div>
        )}
        {form.formState.errors.email && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.email.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>ユーザー名 (使用可能性チェック有り)</label>
        <input
          {...form.register('username')}
          style={{
            ...styles.input,
            ...(form.formState.errors.username ? styles.inputError : {}),
            ...(validationStates.username === 'success' ? styles.inputSuccess : {}),
          }}
          onBlur={(e) => validateUsername(e.target.value)}
        />
        {validationStates.username === 'loading' && (
          <div style={styles.loadingText}>
            <div style={styles.spinner}></div>
            ユーザー名をチェック中...
          </div>
        )}
        {validationStates.username === 'success' && (
          <div style={styles.successText}>✅ 使用可能なユーザー名です</div>
        )}
        {validationStates.username === 'error' && (
          <div style={styles.errorText}>❌ このユーザー名は既に使用されています</div>
        )}
        {form.formState.errors.username && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.username.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>パスワード (複雑な要件)</label>
        <input
          {...form.register('password')}
          type="password"
          style={{
            ...styles.input,
            ...(form.formState.errors.password ? styles.inputError : {}),
          }}
        />
        {form.formState.errors.password && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.password.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>パスワード確認</label>
        <input
          {...form.register('confirmPassword')}
          type="password"
          style={{
            ...styles.input,
            ...(form.formState.errors.confirmPassword ? styles.inputError : {}),
          }}
        />
        {form.formState.errors.confirmPassword && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.confirmPassword.message}</div>
        )}
      </div>
    </div>
  );

  // 👤 Step 2: 個人情報
  const renderStep2 = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        👤 個人情報
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>姓</label>
          <input
            {...form.register('lastName')}
            style={{
              ...styles.input,
              ...(form.formState.errors.lastName ? styles.inputError : {}),
            }}
          />
          {form.formState.errors.lastName && (
            <div style={styles.errorText}>⚠️ {form.formState.errors.lastName.message}</div>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>名</label>
          <input
            {...form.register('firstName')}
            style={{
              ...styles.input,
              ...(form.formState.errors.firstName ? styles.inputError : {}),
            }}
          />
          {form.formState.errors.firstName && (
            <div style={styles.errorText}>⚠️ {form.formState.errors.firstName.message}</div>
          )}
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>生年月日</label>
        <input
          {...form.register('birthDate')}
          type="date"
          style={{
            ...styles.input,
            ...(form.formState.errors.birthDate ? styles.inputError : {}),
          }}
        />
        {form.formState.errors.birthDate && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.birthDate.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>性別</label>
        <select
          {...form.register('gender')}
          style={{
            ...styles.input,
            ...(form.formState.errors.gender ? styles.inputError : {}),
          }}
        >
          <option value="">選択してください</option>
          <option value="male">男性</option>
          <option value="female">女性</option>
          <option value="other">その他</option>
          <option value="no_answer">回答しない</option>
        </select>
        {form.formState.errors.gender && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.gender.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>郵便番号 (自動住所補完)</label>
        <input
          {...form.register('zipCode')}
          placeholder="1234567"
          style={{
            ...styles.input,
            ...(form.formState.errors.zipCode ? styles.inputError : {}),
            ...(validationStates.zipCode === 'success' ? styles.inputSuccess : {}),
          }}
          onBlur={(e) => validateZipCode(e.target.value)}
        />
        {validationStates.zipCode === 'loading' && (
          <div style={styles.loadingText}>
            <div style={styles.spinner}></div>
            住所を取得中...
          </div>
        )}
        {validationStates.zipCode === 'success' && (
          <div style={styles.successText}>✅ 住所を自動入力しました</div>
        )}
        {validationStates.zipCode === 'error' && (
          <div style={styles.errorText}>❌ 郵便番号が見つかりません</div>
        )}
        {form.formState.errors.zipCode && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.zipCode.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>住所</label>
        <textarea
          {...form.register('address')}
          rows={3}
          style={{
            ...styles.input,
            resize: 'vertical',
            ...(form.formState.errors.address ? styles.inputError : {}),
          }}
        />
        {form.formState.errors.address && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.address.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>電話番号</label>
        <input
          {...form.register('phoneNumber')}
          placeholder="090-1234-5678"
          style={{
            ...styles.input,
            ...(form.formState.errors.phoneNumber ? styles.inputError : {}),
          }}
        />
        {form.formState.errors.phoneNumber && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.phoneNumber.message}</div>
        )}
      </div>
    </div>
  );

  // 📁 Step 3: ファイルアップロード
  const renderStep3 = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        📁 ファイルアップロード
      </h2>
      
      <div style={styles.fieldGroup}>
        <label style={styles.label}>プロフィール画像 (ドラッグ&ドロップ対応)</label>
        <div
          style={{
            ...styles.fileUpload,
            ...(dragActive ? styles.fileUploadActive : {}),
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files) {
              handleFileUpload(e.dataTransfer.files, 'profileImage');
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📸</div>
          <div>クリックまたはファイルをドラッグしてアップロード</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            JPG, PNG, GIF (最大10MB)
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          style={styles.hiddenInput}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files, 'profileImage');
            }
          }}
        />

        {form.watch('profileImage')?.length > 0 && (
          <div style={styles.filePreview}>
            {form.watch('profileImage').map((file: FileData) => (
              <div key={file.id} style={styles.fileItem}>
                {file.preview && (
                  <img
                    src={file.preview}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${file.progress}%`,
                    }}
                  />
                </div>
                {file.uploaded && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                  }}>
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {form.formState.errors.profileImage && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.profileImage.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={styles.label}>関連ドキュメント (最低2つ必要)</label>
        <div
          style={styles.fileUpload}
          onClick={() => documentInputRef.current?.click()}
        >
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
          <div>ドキュメントをアップロード</div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
            PDF, DOC, DOCX, TXT (最大10MB)
          </div>
        </div>
        <input
          ref={documentInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          style={styles.hiddenInput}
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files, 'documents');
            }
          }}
        />

        {form.watch('documents')?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            {form.watch('documents').map((file: FileData) => (
              <div key={file.id} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                marginBottom: '8px',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ marginRight: '10px', fontSize: '1.5rem' }}>📄</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{file.file.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {(file.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
                <div style={{ width: '60px', textAlign: 'right' }}>
                  {file.uploaded ? (
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                  ) : (
                    <span style={{ color: '#f59e0b' }}>{Math.round(file.progress)}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {form.formState.errors.documents && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.documents.message}</div>
        )}
      </div>
    </div>
  );

  // 🛒 Step 4: 注文情報
  const renderStep4 = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        🛒 注文情報
      </h2>
      
      <button
        type="button"
        onClick={() => appendOrder({
          id: Math.random().toString(36).substr(2, 9),
          product: '',
          quantity: 1,
          price: 0,
          discount: 0,
          category: '',
        })}
        style={{
          ...styles.button,
          ...styles.primaryButton,
          marginBottom: '20px',
        }}
      >
        ➕ 商品を追加
      </button>

      {orderFields.length > 0 && (
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableCell}>カテゴリ</th>
              <th style={styles.tableCell}>商品</th>
              <th style={styles.tableCell}>数量</th>
              <th style={styles.tableCell}>単価</th>
              <th style={styles.tableCell}>割引率</th>
              <th style={styles.tableCell}>小計</th>
              <th style={styles.tableCell}>操作</th>
            </tr>
          </thead>
          <tbody>
            {orderFields.map((field, index) => {
              const watchedCategory = form.watch(`orderItems.${index}.category`);
              const watchedQuantity = form.watch(`orderItems.${index}.quantity`) || 0;
              const watchedPrice = form.watch(`orderItems.${index}.price`) || 0;
              const watchedDiscount = form.watch(`orderItems.${index}.discount`) || 0;
              
              const subtotal = watchedQuantity * watchedPrice;
              const discountAmount = subtotal * (watchedDiscount / 100);
              const total = subtotal - discountAmount;

              return (
                <tr key={field.id}>
                  <td style={styles.tableCell}>
                    <select
                      {...form.register(`orderItems.${index}.category`)}
                      style={styles.tableInput}
                      onChange={(e) => {
                        form.setValue(`orderItems.${index}.category`, e.target.value);
                        form.setValue(`orderItems.${index}.product`, '');
                        form.setValue(`orderItems.${index}.price`, 0);
                      }}
                    >
                      <option value="">選択</option>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <select
                      {...form.register(`orderItems.${index}.product`)}
                      style={styles.tableInput}
                      onChange={(e) => {
                        const selectedProduct = PRODUCTS[watchedCategory as keyof typeof PRODUCTS]
                          ?.find(p => p.value === e.target.value);
                        if (selectedProduct) {
                          form.setValue(`orderItems.${index}.product`, e.target.value);
                          form.setValue(`orderItems.${index}.price`, selectedProduct.price);
                        }
                      }}
                      disabled={!watchedCategory}
                    >
                      <option value="">選択</option>
                      {watchedCategory && PRODUCTS[watchedCategory as keyof typeof PRODUCTS]?.map(product => (
                        <option key={product.value} value={product.value}>{product.label}</option>
                      ))}
                    </select>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <input
                      {...form.register(`orderItems.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      min="1"
                      style={styles.tableInput}
                    />
                  </td>
                  
                  <td style={styles.tableCell}>
                    <input
                      {...form.register(`orderItems.${index}.price`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      style={styles.tableInput}
                      readOnly
                    />
                  </td>
                  
                  <td style={styles.tableCell}>
                    <input
                      {...form.register(`orderItems.${index}.discount`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="100"
                      style={styles.tableInput}
                    />
                  </td>
                  
                  <td style={styles.tableCell}>
                    <div style={{ fontWeight: 'bold' }}>
                      ¥{total.toLocaleString()}
                    </div>
                  </td>
                  
                  <td style={styles.tableCell}>
                    <button
                      type="button"
                      onClick={() => removeOrder(index)}
                      style={{
                        ...styles.button,
                        ...styles.dangerButton,
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                      }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {orderFields.length > 0 && (
        <div style={styles.calculationPanel}>
          <div style={styles.calculationRow}>
            <span>商品点数:</span>
            <span>{orderFields.length}点</span>
          </div>
          <div style={styles.calculationRow}>
            <span>小計:</span>
            <span>¥{totalAmount.toLocaleString()}</span>
          </div>
          <div style={styles.calculationRow}>
            <span>税率:</span>
            <span>10%</span>
          </div>
          <div style={styles.calculationRow}>
            <span>消費税:</span>
            <span>¥{Math.floor(totalAmount * 0.1).toLocaleString()}</span>
          </div>
          <div style={{ ...styles.calculationRow, ...styles.totalRow }}>
            <span>総合計:</span>
            <span>¥{Math.floor(totalAmount * 1.1).toLocaleString()}</span>
          </div>
        </div>
      )}

      {form.formState.errors.orderItems && (
        <div style={styles.errorText}>⚠️ {form.formState.errors.orderItems.message}</div>
      )}
    </div>
  );

  // ✅ Step 5: 最終確認
  const renderStep5 = () => (
    <div style={styles.section}>
      <h2 style={styles.sectionTitle}>
        ✅ 最終確認
      </h2>
      
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '15px', color: '#374151' }}>入力内容の確認</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4>アカウント情報</h4>
            <p>メール: {form.watch('email')}</p>
            <p>ユーザー名: {form.watch('username')}</p>
          </div>
          
          <div>
            <h4>個人情報</h4>
            <p>氏名: {form.watch('lastName')} {form.watch('firstName')}</p>
            <p>生年月日: {form.watch('birthDate')}</p>
            <p>性別: {form.watch('gender')}</p>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>注文情報</h4>
          <p>商品数: {orderFields.length}点</p>
          <p>総額: ¥{Math.floor(totalAmount * 1.1).toLocaleString()} (税込)</p>
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4>ファイル</h4>
          <p>プロフィール画像: {form.watch('profileImage')?.length || 0}件</p>
          <p>ドキュメント: {form.watch('documents')?.length || 0}件</p>
        </div>
      </div>

      <div style={styles.fieldGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            {...form.register('agreeToTerms')}
            type="checkbox"
            style={{ width: '18px', height: '18px' }}
          />
          <span style={styles.label}>利用規約に同意する (必須)</span>
        </label>
        {form.formState.errors.agreeToTerms && (
          <div style={styles.errorText}>⚠️ {form.formState.errors.agreeToTerms.message}</div>
        )}
      </div>

      <div style={styles.fieldGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            {...form.register('subscribeNewsletter')}
            type="checkbox"
            style={{ width: '18px', height: '18px' }}
          />
          <span style={styles.label}>ニュースレターを受信する</span>
        </label>
      </div>

      <div style={styles.fieldGroup}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            {...form.register('autoSaveEnabled')}
            type="checkbox"
            style={{ width: '18px', height: '18px' }}
          />
          <span style={styles.label}>自動保存を有効にする</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      <style>{cssAnimations}</style>
      <div style={styles.container}>
        {/* カウントダウンタイマー */}
        <div style={styles.countdown}>
          ⏰ 残り時間: {formatTime(timeLeft)}
        </div>

        {/* 自動保存インジケーター */}
        {autoSaveStatus && (
          <div style={styles.autoSaveIndicator}>
            {autoSaveStatus === 'saving' && '💾 保存中...'}
            {autoSaveStatus === 'saved' && '✅ 保存完了'}
            {autoSaveStatus === 'error' && '❌ 保存エラー'}
          </div>
        )}

        <h1 style={styles.header}>
          🔥 地獄の超複雑フォーム 🔥
        </h1>

        {/* ステップインジケーター */}
        <div style={styles.stepIndicator}>
          {steps.map((step) => (
            <div key={step.id} style={styles.step}>
              <div
                style={{
                  ...styles.stepNumber,
                  ...(currentStep === step.id ? styles.stepActive : {}),
                  ...(step.completed ? styles.stepCompleted : {}),
                  ...(!step.completed && currentStep !== step.id ? styles.stepPending : {}),
                }}
                onClick={() => goToStep(step.id)}
              >
                {step.completed ? '✓' : step.id}
              </div>
              <div style={styles.stepTitle}>
                <div>{step.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          {renderStepContent()}

          {/* ナビゲーションボタン */}
          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                opacity: currentStep === 1 ? 0.5 : 1,
                cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              ⬅️ 前のステップ
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                }}
              >
                次のステップ ➡️
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...styles.successButton,
                }}
              >
                🎉 地獄から脱出する！
              </button>
            )}
          </div>
        </form>

        {/* デバッグ情報 */}
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '20px',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          maxWidth: '300px',
          zIndex: 1000,
        }}>
          <div>Step: {currentStep}/5</div>
          <div>Total: ¥{Math.floor(totalAmount * 1.1).toLocaleString()}</div>
          <div>Items: {orderFields.length}</div>
          <div>Valid: {form.formState.isValid ? '✅' : '❌'}</div>
        </div>
      </div>
    </>
  );
}

export default App;
