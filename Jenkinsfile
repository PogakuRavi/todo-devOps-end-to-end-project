pipeline {
    agent any

    environment {
        AWS_REGION = "ap-east-1"
        ECR_REPO = "145023112348.dkr.ecr.ap-east-1.amazonaws.com/todo-app"
        IMAGE_TAG = "latest"
        SONARQUBE_ENV = "sonar-server"
    }

    tools {
        nodejs "nodejs"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/PogakuRavi/todo-devOps-end-to-end-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'cd backend && npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=todo-app \
                      -Dsonar.projectName=todo-app \
                      -Dsonar.sources=backend \
                      -Dsonar.sourceEncoding=UTF-8
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t todo-app .'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh 'trivy image todo-app'
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                aws ecr get-login-password --region $AWS_REGION \
                | docker login --username AWS --password-stdin $ECR_REPO
                '''
            }
        }

        stage('Tag Image') {
            steps {
                sh '''
                docker tag todo-app:latest $ECR_REPO:$IMAGE_TAG
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                docker push $ECR_REPO:$IMAGE_TAG
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully 🚀"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}
