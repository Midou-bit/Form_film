import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { addComment, deleteComment } from "./Redux/commentSlice";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Card,
  Button,
  Form,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

const schema = yup.object().shape({
  comment: yup
    .string()
    .required("Le commentaire est obligatoire")
    .max(500, "Le commentaire ne doit pas dépasser 500 caractères."),
  note: yup
    .number()
    .typeError("Veuillez sélectionner une note.")
    .required("Veuillez sélectionner une note.")
    .min(1, "La note doit être au minimum de 1.")
    .max(5, "La note doit être au maximum de 5."),
  acceptConditions: yup
    .bool()
    .oneOf([true], "Vous devez accepter les conditions générales."),
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const comments = useSelector((state) => state.comments);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch("https://jsonfakery.com/movies/random/1");
        if (!res.ok) {
          throw new Error(`Erreur HTTP : ${res.status} - ${res.statusText}`);
        }
        const data = await res.json();
        setMovie(data[0]);
      } catch (err) {
        console.error("Erreur lors de la récupération du film :", err.message);
        setError("Erreur lors du chargement du film.");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    const { comment, note } = data;
    dispatch(addComment({ comment, note }));
    reset({
      comment: "",
      note: "",
      acceptConditions: false,
    });
    
  };

  return (
    <Container className="app-container">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          {loading && <p>Chargement...</p>}
          {error && <Alert variant="danger">{error}</Alert>}

          {movie && (
            <Card className="mb-4">
              <Card.Img
                variant="top"
                src={movie.poster_path}
                alt={movie.original_title}
                className="movie-poster"
              />
              <Card.Body>
                <Card.Title>{movie.original_title}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Sortie le{" "}
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString("fr-FR")
                    : "Inconnue"}
                </Card.Subtitle>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Text>
                  Note moyenne :{" "}
                  {movie.vote_average && movie.vote_count
                    ? `${movie.vote_average} (${movie.vote_count} votes)`
                    : "(aucune note)"}
                </Card.Text>
              </Card.Body>
            </Card>
          )}

          <h4>Commentaires</h4>

          <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Ajouter un commentaire</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...register("comment")}
                isInvalid={!!errors.comment}
              />
              <Form.Control.Feedback type="invalid">
                {errors.comment?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Select {...register("note")} isInvalid={!!errors.note}>
                <option value="">Sélectionnez une note</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.note?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="J’accepte les conditions générales"
                {...register("acceptConditions")}
                isInvalid={!!errors.acceptConditions}
              />
              <Form.Control.Feedback type="invalid">
                {errors.acceptConditions?.message}
              </Form.Control.Feedback>
            </Form.Group>

            <Button type="submit">Ajouter</Button>
          </Form>

          {comments.length > 0 ? (
            comments.map((c) => (
              <Card key={c.id} className="mb-2">
                <Card.Body>
                  <Card.Title>Note : {c.note}/5</Card.Title>
                  <Card.Text>{c.comment}</Card.Text>
                  <Button
                    variant="danger"
                    onClick={() => dispatch(deleteComment(c.id))}
                  >
                    Supprimer
                  </Button>
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="info">Aucun commentaire pour le moment.</Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
