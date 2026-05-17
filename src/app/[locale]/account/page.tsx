import AccountForms from './_components/AccountForms';

export default function AccountPage() {
  return (
    <div className="py-16 min-h-[70vh]">
      <div className="container max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Вход и регистрация</h1>
          <p className="text-[var(--color-text-muted)]">
            Войдите в аккаунт или создайте новый
          </p>
        </div>
        <AccountForms />
      </div>
    </div>
  );
}
