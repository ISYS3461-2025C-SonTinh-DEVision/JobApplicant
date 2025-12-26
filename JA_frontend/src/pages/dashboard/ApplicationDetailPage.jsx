
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApplicationDetailView } from '../../components/application/ApplicationDetailView';
import { useApplicationDetail } from '../../hooks/useApplicationDetail';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/reusable/Button';

export default function ApplicationDetailPage() {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const {
        application,
        loading,
        error,
        actionLoading,
        handleWithdraw,
        handleReapply,
        refresh
    } = useApplicationDetail(applicationId);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading application</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Button onClick={refresh}>Try Again</Button>
            </div>
        );
    }

    return (
        <ApplicationDetailView
            application={application}
            onBack={() => navigate('/dashboard/applications')}
            onWithdraw={handleWithdraw}
            onReapply={handleReapply}
            actionLoading={actionLoading}
        />
    );
}
