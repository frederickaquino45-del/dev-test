import React, { Suspense, useEffect, useState } from "react";
import { Button, Card, Row } from "react-bootstrap";
import { NAVIGATION_PATH } from "@/constants";
import { User } from "@/types/api/User";
import { UserFilter } from "@/types/api/filters/UserFilter";
import DataTable from "@/components/DataTable";
import { Link } from "react-router-dom";
import { HiOutlinePencilAlt } from "react-icons/hi";
import Loader from "@/components/Loader";
import UserService from "@/services/UserService";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import { UserProfile } from "@/types/api/enums/UserProfile";
import { getBadgeColorByUserProfile } from "@/types/api/enums/UserProfile";

const UserListing = () => {
  const [date, setDate] = useState<Date>();

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <>
      <Row style={{ justifyContent: "end", margin: "10px 0", gap: 8 }}>
        <Link to={NAVIGATION_PATH.USERS.CREATE.ABSOLUTE}>
          <Button style={{ maxWidth: "fit-content" }}>Adicionar</Button>
        </Link>
      </Row>

      <Card>
        <Card.Header>
          <Card.Title>Usuários</Card.Title>
        </Card.Header>
        <Suspense fallback={<><Loader /><br /><br /></>}>
          <DataTable<User, UserFilter>
            thin
            columns={[
              { Header: "Nome de usuário", accessor: "username" },
              {
                Header: "Perfil",
                accessor: "profile",
                Cell: ({ value }) => (
                  <span className={`badge bg-${getBadgeColorByUserProfile(UserProfile[value as UserProfile]) ?? "secondary"}`}>
                    {value === UserProfile.Administrator ? "Administrador" : "Operador"}
                  </span>
                ),
              },
              {
                Header: "Ações",
                id: "actions",
                Cell: ({ row }) =>
                  row.original.id ? (
                    <Link
                      to={`${NAVIGATION_PATH.USERS.EDIT.ABSOLUTE}/${row.original.id}`}
                      title="editar"
                    >
                      <HiOutlinePencilAlt size={18} />
                    </Link>
                  ) : null,
              },
            ]}
            query={async (filters) => {
              const all = await UserService.getAll();
              const usernameValue = filters.find((f) => f.name === "username")?.value as string | undefined;
              if (!usernameValue?.trim()) return all;
              return all.filter((u) =>
                u.username.toLowerCase().includes(String(usernameValue).toLowerCase())
              );
            }}
            fetchButton
            cleanButton
            filters={[
              {
                name: "username" as keyof UserFilter,
                label: "Nome de usuário",
                componentType: TextFormFieldType.INPUT,
                placeholder: "Nome de usuário",
                commitOnBlur: true,
              },
            ]}
            queryName={["user", "listing", date]}
          />
        </Suspense>
      </Card>
    </>
  );
};

export default UserListing;
