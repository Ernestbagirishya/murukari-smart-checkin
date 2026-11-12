pipeline {
    agent any
    stages {
        stage('Checkout Code') {
            steps {
                echo 'Pulling code from GitHub...'
            }
        }
        stage('Build Docker Images') {
            steps {
                echo 'Building backend and frontend containers...'
                sh 'docker compose build'
            }
        }
    }
}