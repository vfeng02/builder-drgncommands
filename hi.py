print('''#!/bin/bash
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=1
#SBATCH --mem-per-cpu=4G
#SBATCH --time=00:10:00
#SBATCH --job-name=hi
 
module purge 
module load anaconda3/2023.9
conda activate drgncommands
 
cryodrgn direct_traversal b ''')