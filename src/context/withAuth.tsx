import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Spinner from '@/components/main/spinner';

const withAuth = (WrappedComponent: React.ComponentType) => {
  const Wrapper = (props: any) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
        return;
      }

      // Verificar se o usuário está aprovado
      if (!isLoading && isAuthenticated && user) {
        if (user.approval_status === 'pending' || user.approval_status === 'rejected') {
          router.push('/pending-approval');
          return;
        }
      }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) {
      return <Spinner />;
    }

    if (!isAuthenticated) {
      return null;
    }

    // Verificar se o usuário não está aprovado
    if (user && (user.approval_status === 'pending' || user.approval_status === 'rejected')) {
      return <Spinner />; // Mostra spinner enquanto redireciona
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
