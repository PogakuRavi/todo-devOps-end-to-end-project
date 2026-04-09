pipeline {
    agent any

    environment {
        AWS_REGION = "us-east-1"
        ACCOUNT_ID = "145023112348"
        ECR_REPO_NAME = "todo-app"
        IMAGE_TAG = "${BUILD_NUMBER}"
        ECR_URI = "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"
        SONARQUBE_ENV = "sonar-server"
    }
    
    stages {

        stage('Checkout Code') {
            steps {
            git branch: 'main', url: 'https://github.com/PogakuRavi/todo-devOps-end-to-end-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'cd backend && npm install'
            }
        }

        stage('SonarQube Scan') {
            steps {
            script {
                def scannerHome = tool 'SonarQubeScanner'
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh """
                    ${scannerHome}/bin/sonar-scanner \
                      -Dsonar.projectKey=todo-app \
                      -Dsonar.projectName=todo-app \
                      -Dsonar.sources=backend \
                      -Dsonar.sourceEncoding=UTF-8
                    """
                    }
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                docker build -t ${ECR_REPO_NAME}:${IMAGE_TAG} .
                '''
            }
        }

          stage('Trivy Scan') {
            steps {
                sh '''
                docker run --rm \
                  -v /var/run/docker.sock:/var/run/docker.sock \
                  aquasec/trivy:0.50.1 image ${ECR_REPO_NAME}:${IMAGE_TAG}
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-creds'
                ]]) {
                    sh '''
                    # Login to ECR
                    aws ecr get-login-password --region ${AWS_REGION} \
                    | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                    # Tag image with build number
                    docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}

                    # Push image
                    docker push ${ECR_URI}:${IMAGE_TAG}
                    '''
                }
            }
        }
         stage('Update Helm Chart') {
            steps {
            withCredentials([string(credentialsId: 'github-token', variable: 'GIT_TOKEN')]) {
        sh '''
            rm -rf helm-repo
            git clone https://${GIT_TOKEN}@github.com/PogakuRavi/todo-devOps-end-to-end-project.git helm-repo
            cd helm-repo/helm/todo-app
            sed -i 's/tag:.*/tag: "'${IMAGE_TAG}'"/' values.yaml
            git config user.name "jenkins"
            git config user.email "jenkins@gmail.com"
            git add values.yaml
            git commit -m "Update image tag ${IMAGE_TAG}"
            git push
        '''
            }
        }
    }
}

    post {
        success {
            echo "Image pushed: ${ECR_URI}:${IMAGE_TAG} 🚀"
        }
        failure {
            echo "Pipeline failed ❌"
        }
    }
}
