import '../styles/globals.css'
import '../styles/bootstrap.min.css';
import Layout from './components/Layout';
import { AuthProvider } from "../libs/context"
import { Helmet } from "react-helmet";

function MyApp({ Component, pageProps }) {

  return (

    <AuthProvider >
      <Layout>
        <Helmet>
          <script src="https://3d-api.si.edu/resources/js/voyager-explorer.min.js"></script>
        </Helmet>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>

  )
}

export default MyApp
