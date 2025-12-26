
import { useState, useCallback, useEffect } from 'react';
import applicationService from '../services/ApplicationService';
import { toast } from '../components/reusable/Toast';

export function useApplicationDetail(applicationId) {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchApplication = useCallback(async () => {
        if (!applicationId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await applicationService.getApplicationById(applicationId);
            setApplication(data);
        } catch (err) {
            setError(err.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    }, [applicationId]);

    useEffect(() => {
        fetchApplication();
    }, [fetchApplication]);

    const handleWithdraw = async () => {
        if (!application) return;
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;

        setActionLoading(true);
        try {
            const updatedApp = await applicationService.withdrawApplication(application.id);
            setApplication(updatedApp);
            // Assuming toast is available globally or imported, using simple alert/console fallback if not
            console.log('Application withdrawn');
        } catch (err) {
            console.error(err);
            alert('Failed to withdraw application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReapply = async () => {
        if (!application) return;

        setActionLoading(true);
        try {
            const updatedApp = await applicationService.reapply(application.id);
            setApplication(updatedApp);
            console.log('Re-applied successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to reapply');
        } finally {
            setActionLoading(false);
        }
    };

    return {
        application,
        loading,
        error,
        actionLoading,
        handleWithdraw,
        handleReapply,
        refresh: fetchApplication
    };
}
