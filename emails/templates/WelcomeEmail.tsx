import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Button,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  nombre: string;
}

export const WelcomeEmail = ({ nombre }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido(a) a Kelly's Cake - Tienes 20 puntos de regalo 🎂</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>¡Hola {nombre}!</Heading>
          
          <Text style={text}>
            Bienvenido(a) a la familia <strong>Kelly's Cake</strong>. Estamos muy felices de tenerte aquí.
          </Text>
          
          <Section style={rewardsSection}>
            <Text style={textBold}>
              ¡Tienes 20 puntos de regalo! 🎁
            </Text>
            <Text style={text}>
              Por registrarte hoy, te hemos abonado 20 puntos de Kelly's Rewards en tu cuenta. 
              Además, recuerda que puedes usar tu primer descuento al hacer tu pedido.
            </Text>
          </Section>

          <Section style={btnContainer}>
            <Button style={button} href="https://kellyscake.pe/productos">
              Explorar Catálogo
            </Button>
          </Section>

          <Text style={footer}>
            Si tienes alguna duda, responde a este correo o escríbenos a nuestro WhatsApp. <br />
            — El equipo de Kelly's Cake
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: "#FFFCF7",
  fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #F5EDE4",
};

const h1 = {
  color: "#2C1810",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.4",
  marginBottom: "24px",
};

const text = {
  color: "#8B7355",
  fontSize: "16px",
  lineHeight: "1.6",
  marginBottom: "16px",
};

const textBold = {
  color: "#C8956C",
  fontSize: "18px",
  fontWeight: "bold",
  lineHeight: "1.6",
  marginBottom: "8px",
};

const rewardsSection = {
  backgroundColor: "#FFF8F0",
  padding: "24px",
  borderRadius: "8px",
  marginBottom: "24px",
};

const btnContainer = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#C8956C",
  borderRadius: "30px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const footer = {
  color: "#9ca299",
  fontSize: "14px",
  lineHeight: "1.5",
  marginTop: "32px",
  borderTop: "1px solid #F5EDE4",
  paddingTop: "24px",
};
