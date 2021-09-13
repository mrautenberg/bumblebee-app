import Head from "next/head"
import Header from "./Header"
import Footer from "./Footer"
import styles from "../styles/Layout.module.css"

export default function Layout({ title, keywords, description, children }) {
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
      </Head>

      <Header />
      <div className={styles.container}>{children}</div>
      <Footer />
    </div>
  )
}

// Default props to ensure that we
// always have something SEO friendly in head
Layout.defaultProps = {
  title: "Bumbleebee | Identify bumblebees",
  description: "Helps you to identify bumbleebees",
  keywords: "bumblebee, insect, identify",
}
