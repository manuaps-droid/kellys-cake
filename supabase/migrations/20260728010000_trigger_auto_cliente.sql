-- Trigger para crear fila en 'clientes' automáticamente cuando se crea un usuario en auth.users
-- Esto funciona incluso con confirmación de email porque el trigger corre en la DB

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.clientes (user_id, nombre, apellidos, correo, celular, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), 'Cliente'),
    COALESCE(NEW.raw_user_meta_data ->> 'apellidos', trim(both ' ' from replace(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.raw_user_meta_data ->> 'full_name', ' ', 1), ''))),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'celular', ''),
    'cliente',
    true
  );
  RETURN NEW;
END;
$$;

-- Crear el trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
