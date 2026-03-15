import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { NAVIGATION_PATH } from "@/constants";
import { User } from "@/types/api/User";
import { TextFormFieldType } from "@/components/form/TextFormField/TextFormFieldType";
import { TextFormField } from "@/components/form/TextFormField/TextFormField";
import Loader from "@/components/Loader";
import { toastr } from "@/utils/toastr";
import UserService from "@/services/UserService";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/ReactQueryKeys";
import yup from "@/utils/yup";
import React, { Suspense } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Formik } from "formik";
import { userProfileOptions } from "@/types/api/enums/UserProfile";
import { UserProfile } from "@/types/api/enums/UserProfile";

const getInitialValues = (isEdit: boolean): User => ({
  username: "",
  password: "",
  profile: UserProfile.Administrator,
  ...(isEdit ? {} : {}),
});

const createSchema = yup.object().shape({
  username: yup.string().required("Nome de usuário é obrigatório"),
  password: yup.string().required("Senha é obrigatória").min(6, "Senha deve ter no mínimo 6 caracteres"),
  profile: yup.number().required("Perfil é obrigatório"),
});

const editSchema = yup.object().shape({
  username: yup.string().required("Nome de usuário é obrigatório"),
  profile: yup.number().required("Perfil é obrigatório"),
});

const profileOptions = userProfileOptions().map((p) => ({
  id: String(p.id),
  name: p.name,
}));

const UserForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { data } = useSuspenseQuery<User>({
    queryKey: [ReactQueryKeys.USER, id],
    meta: {
      fetchFn: async () => {
        if (id) {
          const user = await UserService.getById(id);
          return { ...user, password: undefined };
        }
        return getInitialValues(false);
      },
    },
  });

  async function onSubmit(values: User) {
    try {
      const profile = Number(values.profile) as UserProfile;
      if (isEdit && id) {
        await UserService.update(id, {
          id,
          username: values.username,
          profile,
        });
        toastr({ title: "Usuário atualizado com sucesso", icon: "success" });
      } else {
        await UserService.create({
          username: values.username,
          password: values.password ?? "",
          profile,
        });
        toastr({ title: "Usuário criado com sucesso", icon: "success" });
      }
      void queryClient.invalidateQueries({ queryKey: [ReactQueryKeys.USER] });
      navigate(NAVIGATION_PATH.USERS.LISTING.ABSOLUTE);
    } catch (err: unknown) {
      const message = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Erro ao salvar";
      toastr({ title: "Erro", text: message, icon: "error" });
    }
  }

  const title = isEdit ? "Editar Usuário" : "Novo Usuário";
  const validationSchema = isEdit ? editSchema : createSchema;
  const initialValues: User = isEdit
    ? { ...data, password: undefined }
    : { ...getInitialValues(false), ...data };

  return (
    <React.Fragment>
      <Helmet title={title} />
      <Suspense fallback={<><Loader /><br /><br /></>}>
        <Card>
          <Card.Header>
            <Card.Title>{title}</Card.Title>
          </Card.Header>
          <Card.Body>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              enableReinitialize={true}
            >
              {({
                handleSubmit,
                handleChange,
                handleBlur,
                errors,
                values,
                isSubmitting,
                isValid,
              }) => (
                <Form noValidate onSubmit={handleSubmit}>
                  <Row>
                    <Col md={4}>
                      <TextFormField
                        componentType={TextFormFieldType.INPUT}
                        name="username"
                        label="Nome de usuário"
                        required
                        placeholder="Nome de usuário"
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.username}
                        formikError={errors.username}
                      />
                    </Col>
                    {!isEdit && (
                      <Col md={4}>
                        <TextFormField
                          componentType={TextFormFieldType.INPUT}
                          name="password"
                          label="Senha"
                          required
                          placeholder="Senha"
                          password
                          handleBlur={handleBlur}
                          handleChange={handleChange}
                          value={values.password ?? ""}
                          formikError={errors.password}
                        />
                      </Col>
                    )}
                    <Col md={4}>
                      <TextFormField
                        componentType={TextFormFieldType.SELECT}
                        name="profile"
                        label="Perfil"
                        required
                        placeholder="Selecione o perfil"
                        options={profileOptions}
                        handleBlur={handleBlur}
                        handleChange={handleChange}
                        value={values.profile != null ? String(values.profile) : ""}
                        formikError={errors.profile}
                      />
                    </Col>
                  </Row>
                  <br />
                  <Button type="submit" variant="primary" disabled={!isValid || isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    variant="secondary"
                    style={{ marginLeft: 5 }}
                    onClick={() => navigate(NAVIGATION_PATH.USERS.LISTING.ABSOLUTE)}
                  >
                    Voltar
                  </Button>
                </Form>
              )}
            </Formik>
          </Card.Body>
        </Card>
      </Suspense>
    </React.Fragment>
  );
};

export default UserForm;
