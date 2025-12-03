import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Heart, 
  Dog, 
  Calendar, 
  Wallet, 
  CheckCircle, 
  ChevronRight, 
  Settings, 
  ArrowLeft,
  Shield,
  CreditCard,
  User,
  History,
  LogOut
} from 'lucide-react';
import { Button, Card, Input, PageTransition } from './components/UIComponents';
import { UserRole, AppStep, UserState, GUARDIAN_TIERS, PaymentRecord } from './types';

// Mock function for "Payment"
const mockPayment = () => new Promise<void>((resolve) => setTimeout(resolve, 2000));

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.START);
  const [user, setUser] = useState<UserState>({
    role: UserRole.NONE,
    petName: '',
    paymentDay: 15,
    amount: 0,
    isRecurring: true,
    history: []
  });

  // Local state for Amount Step specifically
  const [selectedGuardianTier, setSelectedGuardianTier] = useState<string | null>(null);
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [amountError, setAmountError] = useState<string>('');

  // Local state for Date Step
  const [tempDay, setTempDay] = useState<string>('15');

  // --- Effects ---

  // Handle Payment Process
  useEffect(() => {
    if (step === AppStep.PAYMENT_PROCESS) {
      const executePayment = async () => {
        await mockPayment();
        
        setUser(prev => {
            const newRecord: PaymentRecord = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toLocaleDateString('ru-RU'),
                amount: prev.amount,
                petName: prev.petName,
                role: prev.role,
                status: 'completed'
            };
            return { 
                ...prev, 
                history: [newRecord, ...prev.history] 
            };
        });
        
        setStep(AppStep.DASHBOARD);
      };

      executePayment();
    }
  }, [step]);

  // --- Handlers ---

  const handleRoleSelect = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
    setStep(AppStep.ROLE_INFO);
  };

  const handleRoleConfirm = () => {
    setStep(AppStep.PET_NAME);
  };

  const handlePetNameSubmit = (name: string) => {
    if (!name.trim()) return;
    setUser(prev => ({ ...prev, petName: name }));
    setStep(AppStep.PAYMENT_DATE);
  };

  const handleDateSubmit = () => {
    const day = parseInt(tempDay);
    if (isNaN(day) || day < 1 || day > 31) return;
    setUser(prev => ({ ...prev, paymentDay: day }));
    setStep(AppStep.AMOUNT_SELECTION);
  };

  const validateAndSetAmount = () => {
    let finalAmount = 0;

    if (user.role === UserRole.GUARDIAN) {
        if (selectedGuardianTier === 'PARTIAL') {
            const val = parseInt(customAmountStr);
            if (isNaN(val) || val < GUARDIAN_TIERS.PARTIAL.min) {
                setAmountError(`Минимальная сумма ${GUARDIAN_TIERS.PARTIAL.min}₽`);
                return;
            }
            finalAmount = val;
        } else if (selectedGuardianTier === 'STANDARD') {
            finalAmount = GUARDIAN_TIERS.STANDARD.amount;
        } else if (selectedGuardianTier === 'FULL') {
            finalAmount = GUARDIAN_TIERS.FULL.amount;
        }
    } else {
        // Curator
        const val = parseInt(customAmountStr);
        if (isNaN(val) || val <= 0) {
            setAmountError('Введите корректную сумму');
            return;
        }
        finalAmount = val;
    }

    setUser(prev => ({ ...prev, amount: finalAmount }));
    setStep(AppStep.CONFIRMATION);
  };

  const resetFlow = () => {
      setStep(AppStep.START);
      setUser({
        role: UserRole.NONE,
        petName: '',
        paymentDay: 15,
        amount: 0,
        isRecurring: true,
        history: user.history // Keep history for demo
      });
      setSelectedGuardianTier(null);
      setCustomAmountStr('');
      setAmountError('');
  };

  const goBack = () => {
      // Simple back logic mapping
      switch (step) {
          case AppStep.ROLE_INFO: setStep(AppStep.START); break;
          case AppStep.PET_NAME: setStep(AppStep.ROLE_INFO); break;
          case AppStep.PAYMENT_DATE: setStep(AppStep.PET_NAME); break;
          case AppStep.AMOUNT_SELECTION: setStep(AppStep.PAYMENT_DATE); break;
          case AppStep.CONFIRMATION: setStep(AppStep.AMOUNT_SELECTION); break;
          default: break;
      }
  };

  // --- Screens ---

  // 1. Start Screen
  const renderStart = () => (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 pt-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4"
        >
          <Dog size={64} className="text-blue-600" />
        </motion.div>
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Привет, Друг! 🐾</h1>
          <p className="text-slate-500">Выберите, как вы хотите помочь хвостикам сегодня.</p>
        </div>

        <div className="w-full space-y-4 mt-8">
          <Button fullWidth onClick={() => handleRoleSelect(UserRole.GUARDIAN)} className="text-lg h-16">
            <Shield className="w-6 h-6" />
            Я — Опекун
          </Button>
          <Button fullWidth variant="secondary" onClick={() => handleRoleSelect(UserRole.CURATOR)} className="text-lg h-16">
            <Heart className="w-6 h-6" />
            Я — Куратор
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 2. Role Info
  const renderRoleInfo = () => (
    <PageTransition>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={goBack} className="p-0 mr-4"><ArrowLeft /></Button>
            <h2 className="text-2xl font-bold">{user.role === UserRole.GUARDIAN ? 'Об Опеке' : 'О Кураторстве'}</h2>
        </div>

        <div className="flex-grow space-y-6">
          {user.role === UserRole.GUARDIAN ? (
            <div className="space-y-4">
              <Card className="bg-blue-50 border-blue-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">Частичная</span>
                  <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600">от 3500₽</span>
                </div>
                <p className="text-sm text-slate-500">Помощь в оплате части расходов на содержание.</p>
              </Card>
              <Card>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">Стандартная</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold text-slate-700">8000₽</span>
                </div>
                <p className="text-sm text-slate-500">Покрывает корм и базовый уход.</p>
              </Card>
              <Card>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-700">Полная</span>
                  <span className="bg-amber-100 px-3 py-1 rounded-full text-sm font-semibold text-amber-700">15000₽</span>
                </div>
                <p className="text-sm text-slate-500">Полное обеспечение жизни питомца.</p>
              </Card>
            </div>
          ) : (
            <Card className="bg-amber-50 border-amber-100">
              <h3 className="font-bold text-amber-800 text-lg mb-2">Свободный взнос</h3>
              <p className="text-amber-900/70">
                Куратор оплачивает передержку своего подопечного. Сумма произвольная и зависит только от ваших возможностей.
              </p>
            </Card>
          )}
        </div>

        <div className="mt-auto">
          <Button fullWidth onClick={handleRoleConfirm}>
            Выбрать питомца <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 3. Pet Name
  const renderPetName = () => (
    <PageTransition>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={goBack} className="p-0 mr-4"><ArrowLeft /></Button>
            <h2 className="text-2xl font-bold">Кого поддержим?</h2>
        </div>

        <div className="flex-grow flex flex-col justify-center">
            <div className="bg-white p-2 rounded-full w-20 h-20 flex items-center justify-center shadow-md mb-6 mx-auto">
                <Dog size={32} className="text-slate-400" />
            </div>
            <Input 
                autoFocus
                label="Кличка питомца"
                placeholder="Например: Кай"
                value={user.petName}
                onChange={(e) => setUser({...user, petName: e.target.value})}
            />
        </div>

        <div className="mt-auto">
          <Button fullWidth onClick={() => handlePetNameSubmit(user.petName)} disabled={!user.petName}>
            Далее <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 4. Date Selection
  const renderDate = () => (
    <PageTransition>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={goBack} className="p-0 mr-4"><ArrowLeft /></Button>
            <h2 className="text-2xl font-bold">Дата списания</h2>
        </div>

        <div className="flex-grow space-y-6">
            <p className="text-slate-500">
                Выберите удобный день месяца для автоматического напоминания об оплате.
            </p>
            <div className="flex items-center gap-4">
                <Input 
                    type="number" 
                    min={1} 
                    max={31} 
                    value={tempDay} 
                    onChange={(e) => setTempDay(e.target.value)}
                    className="text-center text-3xl font-bold h-20"
                />
                <span className="text-xl text-slate-400 font-medium">число каждого месяца</span>
            </div>
            
            {parseInt(tempDay) > 0 && parseInt(tempDay) <= 31 && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3"
                >
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Отлично! Каждый месяц {tempDay}-го числа бот напомнит вам о {user.petName}.</p>
                </motion.div>
            )}
        </div>

        <div className="mt-auto">
          <Button fullWidth onClick={handleDateSubmit}>
            Далее <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 5. Amount Selection
  const renderAmount = () => (
    <PageTransition>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={goBack} className="p-0 mr-4"><ArrowLeft /></Button>
            <h2 className="text-2xl font-bold">Сумма поддержки</h2>
        </div>

        <div className="flex-grow space-y-4">
            {user.role === UserRole.GUARDIAN ? (
                <>
                    <div 
                        onClick={() => { setSelectedGuardianTier('PARTIAL'); setCustomAmountStr(''); setAmountError(''); }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedGuardianTier === 'PARTIAL' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                        <div className="font-bold text-slate-800">Частичная опека</div>
                        <div className="text-slate-500 text-sm">от {GUARDIAN_TIERS.PARTIAL.min}₽</div>
                        {selectedGuardianTier === 'PARTIAL' && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-3">
                                <Input 
                                    type="number" 
                                    placeholder="Введите сумму" 
                                    value={customAmountStr}
                                    onChange={(e) => { setCustomAmountStr(e.target.value); setAmountError(''); }}
                                    error={amountError}
                                />
                            </motion.div>
                        )}
                    </div>

                    <div 
                        onClick={() => { setSelectedGuardianTier('STANDARD'); setAmountError(''); }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedGuardianTier === 'STANDARD' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                        <div>
                            <div className="font-bold text-slate-800">Стандартная</div>
                            <div className="text-slate-500 text-sm">Всё включено</div>
                        </div>
                        <div className="font-bold text-lg">{GUARDIAN_TIERS.STANDARD.amount}₽</div>
                    </div>

                    <div 
                        onClick={() => { setSelectedGuardianTier('FULL'); setAmountError(''); }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${selectedGuardianTier === 'FULL' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'}`}
                    >
                        <div>
                            <div className="font-bold text-slate-800">Полная опека</div>
                            <div className="text-slate-500 text-sm">Максимальная забота</div>
                        </div>
                        <div className="font-bold text-lg">{GUARDIAN_TIERS.FULL.amount}₽</div>
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <p className="text-slate-500">Введите комфортную сумму для передержки.</p>
                    <Input 
                        label="Сумма (₽)"
                        type="number" 
                        placeholder="0" 
                        className="text-2xl font-bold"
                        value={customAmountStr}
                        onChange={(e) => { setCustomAmountStr(e.target.value); setAmountError(''); }}
                        error={amountError}
                    />
                </div>
            )}
        </div>

        <div className="mt-auto">
          <Button fullWidth onClick={validateAndSetAmount}>
            К подтверждению <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 6. Confirmation
  const renderConfirmation = () => (
    <PageTransition>
      <div className="p-6 h-full flex flex-col bg-slate-50">
        <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={goBack} className="p-0 mr-4"><ArrowLeft /></Button>
            <h2 className="text-2xl font-bold">Проверим?</h2>
        </div>

        <div className="flex-grow">
            <Card className="shadow-lg border-0 mb-6">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        {user.role === UserRole.GUARDIAN ? <Shield /> : <Heart />}
                     </div>
                     <div>
                        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Роль</div>
                        <div className="font-bold text-lg">{user.role === UserRole.GUARDIAN ? 'Опекун' : 'Куратор'}</div>
                     </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Питомец</span>
                        <span className="font-medium text-slate-800">{user.petName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Дата списания</span>
                        <span className="font-medium text-slate-800">Ежемесячно {user.paymentDay}-го</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <span className="text-slate-800 font-bold">Итого</span>
                        <span className="text-2xl font-bold text-blue-600">{user.amount}₽</span>
                    </div>
                </div>
            </Card>

            <p className="text-center text-xs text-slate-400 px-4">
                Нажимая «Подтвердить», вы соглашаетесь получать уведомления от бота о предстоящих платежах.
            </p>
        </div>

        <div className="mt-auto space-y-3">
          <Button fullWidth onClick={() => setStep(AppStep.PAYMENT_PROCESS)} className="bg-green-600 hover:bg-green-700 shadow-green-200">
             Подтвердить и Оплатить
          </Button>
          <Button fullWidth variant="ghost" onClick={() => setStep(AppStep.AMOUNT_SELECTION)}>
             Изменить
          </Button>
        </div>
      </div>
    </PageTransition>
  );

  // 7. Payment Simulation (Loader) - No hooks allowed here!
  const renderPaymentProcess = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-4 border-slate-200 border-t-blue-500 rounded-full mb-8"
        />
        <h2 className="text-xl font-bold text-slate-700">Обработка платежа...</h2>
        <p className="text-slate-400 mt-2">Переход в платежный шлюз</p>
    </div>
  );

  // 8. Dashboard
  const renderDashboard = () => (
    <PageTransition>
      <div className="h-full flex flex-col bg-slate-50">
        {/* Header */}
        <div className="bg-white p-6 pb-8 rounded-b-3xl shadow-sm z-10 relative">
            <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                        <User className="text-slate-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Мой кабинет</h2>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-medium">
                            {user.role === UserRole.GUARDIAN ? 'Опекун' : 'Куратор'}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" className="p-2 h-auto text-red-400 hover:text-red-500" onClick={resetFlow}>
                    <LogOut size={20} />
                </Button>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="opacity-80 text-sm">Подопечный</div>
                    <Dog className="opacity-80" size={20} />
                </div>
                <div className="text-3xl font-bold mb-1">{user.petName}</div>
                <div className="flex gap-2 items-center text-blue-100 text-sm">
                    <Calendar size={14} /> 
                    <span>Списание {user.paymentDay}-го числа</span>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <History size={18} /> История оплат
            </h3>
            
            <div className="space-y-3">
                {user.history.map((record) => (
                    <motion.div 
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <CheckCircle size={16} />
                            </div>
                            <div>
                                <div className="font-bold text-slate-800">Оплата опеки</div>
                                <div className="text-xs text-slate-400">{record.date}</div>
                            </div>
                        </div>
                        <div className="font-bold text-slate-800">+{record.amount}₽</div>
                    </motion.div>
                ))}
                
                {user.history.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                        История пока пуста
                    </div>
                )}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-slate-100">
            <Button fullWidth variant="outline" className="mb-3">
                <Settings size={18} /> Настройки подписки
            </Button>
            <div className="flex justify-center">
                 <button onClick={() => setStep(AppStep.ADMIN_PANEL)} className="text-xs text-slate-300 hover:text-slate-400 transition-colors">
                    Admin Login
                 </button>
            </div>
        </div>
      </div>
    </PageTransition>
  );

  // 9. Admin Panel (Mock)
  const renderAdmin = () => (
      <PageTransition>
        <div className="h-full flex flex-col bg-slate-900 text-slate-100 p-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2"><Shield className="text-blue-400"/> Admin Panel</h2>
                <Button variant="ghost" className="text-slate-400" onClick={() => setStep(AppStep.DASHBOARD)}>Закрыть</Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm">Опекунов</div>
                    <div className="text-2xl font-bold">142</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl">
                    <div className="text-slate-400 text-sm">Сборы (мес)</div>
                    <div className="text-2xl font-bold text-green-400">845к ₽</div>
                </div>
            </div>

            <h3 className="font-bold mb-4 text-slate-400 text-sm uppercase tracking-wider">Недавние операции</h3>
            <div className="space-y-2 overflow-y-auto flex-grow">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center text-sm">
                        <div>
                            <div className="text-white">User_{1000+i}</div>
                            <div className="text-slate-500 text-xs">Питомец: Барсик</div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-400">+5000₽</div>
                            <div className="text-slate-500 text-xs">Опека</div>
                        </div>
                    </div>
                ))}
            </div>
            
            <Button className="mt-4 bg-blue-600 hover:bg-blue-500" onClick={() => alert('Экспорт в Excel (mock)...')}>
                Скачать отчет (.xlsx)
            </Button>
        </div>
      </PageTransition>
  );

  // Main Render Switch
  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 overflow-hidden relative shadow-2xl sm:rounded-xl sm:h-[800px] sm:mt-10 sm:border sm:border-slate-200">
      <AnimatePresence mode='wait'>
        {step === AppStep.START && <motion.div key="start" className="h-full">{renderStart()}</motion.div>}
        {step === AppStep.ROLE_INFO && <motion.div key="role" className="h-full">{renderRoleInfo()}</motion.div>}
        {step === AppStep.PET_NAME && <motion.div key="pet" className="h-full">{renderPetName()}</motion.div>}
        {step === AppStep.PAYMENT_DATE && <motion.div key="date" className="h-full">{renderDate()}</motion.div>}
        {step === AppStep.AMOUNT_SELECTION && <motion.div key="amount" className="h-full">{renderAmount()}</motion.div>}
        {step === AppStep.CONFIRMATION && <motion.div key="confirm" className="h-full">{renderConfirmation()}</motion.div>}
        {step === AppStep.PAYMENT_PROCESS && <motion.div key="pay" className="h-full">{renderPaymentProcess()}</motion.div>}
        {step === AppStep.DASHBOARD && <motion.div key="dash" className="h-full">{renderDashboard()}</motion.div>}
        {step === AppStep.ADMIN_PANEL && <motion.div key="admin" className="h-full">{renderAdmin()}</motion.div>}
      </AnimatePresence>
    </div>
  );
};

export default App;