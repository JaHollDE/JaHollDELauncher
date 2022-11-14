import Modal from "../components/Modal";
import styled from "styled-components";
import React, { memo } from "react";
import Logo from "../../ui/Logo";

const Success = ({ title, message, closeCallback }) => {
  return (
    <Modal
      closeCallback={closeCallback}
      css={`
        height: auto;
        width: 350px;
      `}
      title="Success!"
    >
      <Container>
        <Logo size={100} />
        <Title>{title}</Title>
        <Message>{message}</Message>
      </Container>
    </Modal>
  );
};

export default memo(Success);

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 900;
  margin-top: 1rem;
  color: ${props => props.theme.palette.text.primary};
`;

const Message = styled.p`
  font-size: 1rem;
  font-weight: 400;
  margin-top: 1rem;
  color: ${props => props.theme.palette.text.primary};
`;