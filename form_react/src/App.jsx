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
  Col
} from "react-bootstrap";

const schema = yup.object().shape({
  comment: yup.string().required("Le commentaire est obligatoire").max(500),
  note: yup
    .number()
    .typeError("Veuillez sélectionner une note.")
    .required("Veuillez sélectionner une note.")
    .min(1)
    .max(5),
  acceptConditions: yup
    .bool()
    .oneOf([true], "Vous devez accepter les conditions générales")
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const comments = useSelector((state) => state.comments);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const defaultPoster = "https://via.placeholder.com/600x300?text=Pas+de+visuel";

  const getPoster = (movie) => {
    if (movie.poster_path) {
      return movie.poster_path.startsWith("http")
        ? movie.poster_path
        : `https://image.tmdb.org/t/p/original${movie.poster_path}`;
    }
    return defaultPoster;
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setError(false);
        setLoading(true);
        const res = await fetch("https://jsonfakery.com/movies/random/1");
        const data = await res.json();
        setMovie(data[0]);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    const { comment, note } = data;
    dispatch(addComment({ comment, note }));
    reset();
  };

  return (
    <Container className="mt-5">
      {loading && <p>Chargement...</p>}
      {error && <Alert variant="danger">Erreur lors du chargement du film.</Alert>}

      {movie && (
        <Card className="mb-4">
          <Card.Img variant="top" src={getPoster(movie)} alt={movie.original_title} />
          <Card.Body>
            <Card.Title>{movie.original_title}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              Sortie le {movie.release_date ? new Date(movie.release_date).toLocaleDateString("fr-FR") : "Inconnue"}
            </Card.Subtitle>
            <Card.Text>{movie.overview}</Card.Text>
            <Card.Text>
              Note moyenne : {movie.vote_average && movie.vote_count ? `${movie.vote_average} (${movie.vote_count} votes)` : "(aucune note)"}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <h4>Commentaires</h4>

      <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Ajouter un commentaire</Form.Label>
          <Form.Control as="textarea" rows={3} {...register("comment")} isInvalid={!!errors.comment} />
          <Form.Control.Feedback type="invalid">{errors.comment?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Note</Form.Label>
          <Form.Select {...register("note")} isInvalid={!!errors.note}>
            <option value="">Sélectionnez une note</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
          </Form.Select>
          <Form.Control.Feedback type="invalid">{errors.note?.message}</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check type="checkbox" label="J’accepte les conditions générales" {...register("acceptConditions")} isInvalid={!!errors.acceptConditions} />
          <Form.Control.Feedback type="invalid">{errors.acceptConditions?.message}</Form.Control.Feedback>
        </Form.Group>

        <Button type="submit">Ajouter</Button>
      </Form>

      {comments.length > 0 ? (
        comments.map((c) => (
          <Card key={c.id} className="mb-2">
            <Card.Body>
              <Card.Title>Note : {c.note}/5</Card.Title>
              <Card.Text>{c.comment}</Card.Text>
              <Button variant="danger" onClick={() => dispatch(deleteComment(c.id))}>
                Supprimer
              </Button>
            </Card.Body>
          </Card>
        ))
      ) : (
        <Alert variant="info">Aucun commentaire pour le moment.</Alert>
      )}
    </Container>
  );
}

export default App;
