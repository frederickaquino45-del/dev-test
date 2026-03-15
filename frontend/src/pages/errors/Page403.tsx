import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "react-bootstrap";
import { HiOutlineLockClosed } from "react-icons/hi";
import { NAVIGATION_PATH } from "@/constants";
import useAppSelector from "@/hooks/useAppSelector";
import { UserProfile } from "@/types/api/enums/UserProfile";

const Page403 = () => {
    const { user } = useAppSelector((state) => state.auth);
    const navigate: string = !!user && user.profile === UserProfile.Operator
        ? NAVIGATION_PATH.CLIENTS.LISTING.ABSOLUTE
        : NAVIGATION_PATH.DASHBOARD.ROOT;

    return (
        <React.Fragment>
            <Helmet title="Acesso negado" />
            <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', maxWidth: '90vw', margin: 'auto' }}>
                <HiOutlineLockClosed size={120} style={{ color: 'var(--bs-secondary)' }} />
                <p className="h2">Acesso negado</p>
                <p className="lead fw-normal mt-3 mb-4">
                    Você não tem autorização para acessar esta página. Entre em contato com o administrador se acredita que deveria ter acesso.
                </p>
                <Link to={navigate}>
                    <Button variant="primary" size="lg">
                        Retornar ao site
                    </Button>
                </Link>
            </div>
        </React.Fragment>
    );
};

export default Page403;
