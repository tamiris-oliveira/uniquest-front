import LoginForm from "@/components/login/loginForm";

const page = () => {
    return (
      <main className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-5xl">
          <LoginForm type="login"/>
        </div>
      </main>
    );
  };
  
  export default page;